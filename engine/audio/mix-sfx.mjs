/** Local sample-exact SFX mixing. Original narration is never normalized, resampled,
 * trimmed, faded or limited. Only licensed source effects receive processing.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

export const sha256File=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const db=amplitude=>amplitude>0?20*Math.log10(amplitude):-Infinity;
const linear=decibels=>10**(decibels/20);
export function signalMetrics(samples){let peak=0,square=0,clips=0;for(const value of samples){if(!Number.isFinite(value))throw Error('Non-finite audio sample');peak=Math.max(peak,Math.abs(value));square+=value*value;if(Math.abs(value)>=1)clips++;}const rms=Math.sqrt(square/Math.max(1,samples.length));return{samples:samples.length,peak,rms,peak_dbfs:db(peak),rms_dbfs:db(rms),clipped_samples:clips};}
function child(command,args){const r=spawnSync(command,args,{maxBuffer:128*1024*1024});if(r.error||r.status!==0)throw Error(`Audio command failed: ${r.error?.message||r.stderr?.toString()}`);return r.stdout;}
function decode(ffmpeg,file,{sampleRate,mono=false}={}){
 const args=['-hide_banner','-v','error','-i',file,'-map','0:a:0','-vn'];
 if(mono)args.push('-ac','1');if(sampleRate)args.push('-ar',String(sampleRate));
 args.push('-c:a','pcm_f32le','-f','f32le','pipe:1');
 const raw=child(ffmpeg,args);if(raw.length%4)throw Error('Invalid decoded float sample data');
 return new Float32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
}
export function writeFloatWav(file,samples,sampleRate){
 const out=Buffer.alloc(56+samples.length*4);
 out.write('RIFF',0);out.writeUInt32LE(out.length-8,4);out.write('WAVE',8);out.write('fmt ',12);out.writeUInt32LE(16,16);out.writeUInt16LE(3,20);out.writeUInt16LE(1,22);out.writeUInt32LE(sampleRate,24);out.writeUInt32LE(sampleRate*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(32,34);out.write('fact',36);out.writeUInt32LE(4,40);out.writeUInt32LE(samples.length,44);out.write('data',48);out.writeUInt32LE(samples.length*4,52);
 for(let i=0;i<samples.length;i++)out.writeFloatLE(samples[i],56+i*4);
 mkdirSync(dirname(file),{recursive:true});writeFileSync(file,out);
}
export function validateMixPlan(plan,manifest){
 if(plan.voice_gain!==1||plan.music!==false)throw Error('Narration gain must be 1 and music disabled');
 if(!Number.isInteger(plan.sample_rate)||plan.sample_rate<8000||plan.channels!==1)throw Error('Mix needs explicit native sample rate and mono');
 if(!Number.isFinite(plan.peak_cap_dbfs)||plan.peak_cap_dbfs>-32||!Number.isFinite(plan.voice_rms_margin_db)||plan.voice_rms_margin_db<18)throw Error('SFX level guard requires peak <= -32 dBFS and voice RMS margin >=18 dB');
 if(manifest.distribution!=='PRIVATE_LOCAL_USE_ONLY'||manifest.license_verified_before_download!==true)throw Error('Library must have verified licensing and private-only distribution');
 if(!Array.isArray(plan.cues)||!plan.cues.length)throw Error('Mix requires a nonempty cue plan');
 const ids=new Set();
 return plan.cues.map(cue=>{
  if(!cue.id||ids.has(cue.id))throw Error('Cue ids must be unique');ids.add(cue.id);
  if(!Number.isFinite(cue.time)||cue.time<0||(cue.trim_seconds!==undefined&&(!Number.isFinite(cue.trim_seconds)||cue.trim_seconds<=0)))throw Error('Cue time/trim invalid');
  for(const key of ['fade_in_seconds','fade_out_seconds'])if(cue[key]!==undefined&&(!Number.isFinite(cue[key])||cue[key]<0))throw Error('Cue fades invalid');
  const asset=manifest.assets.find(asset=>asset.asset_id===cue.asset_id);
  // The catalog can attest that this engine did not generate the sound; it must
  // not invent an undisclosed upstream recording/synthesis method.
  if(!asset||!asset.license||!asset.license_url?.startsWith('https://')||!asset.source_url?.startsWith('https://')||!/^[0-9a-f]{64}$/.test(asset.sha256)||!asset.local_filepath||asset.generated_by_video_engine!==false||!asset.redistribution?.startsWith('private_local_only'))throw Error(`Unverified source/rights for ${cue.asset_id}`);
  return{cue,asset};
 });
}
export function attenuateCue(source,voice,{peakCapDbfs=-32,voiceMarginDb=18,fadeInSamples=0,fadeOutSamples=0}={}){
 if(peakCapDbfs>-32||voiceMarginDb<18)throw Error('Unsafe requested SFX level policy');
 if(source.length!==voice.length||!source.length)throw Error('Cue and concurrent voice must have equal nonzero length');
 if(fadeInSamples+fadeOutSamples>source.length)throw Error('Cue fades exceed cue duration');
 const shaped=new Float32Array(source.length);
 for(let i=0;i<source.length;i++){const attack=fadeInSamples>1?Math.min(1,i/(fadeInSamples-1)):1;const release=fadeOutSamples>1?Math.min(1,(source.length-1-i)/(fadeOutSamples-1)):1;shaped[i]=source[i]*Math.max(0,Math.min(attack,release));}
 const before=signalMetrics(shaped),voiceMetrics=signalMetrics(voice);
 if(before.peak===0)throw Error('Silent SFX cue');
 const voiceNonsilent=voiceMetrics.rms_dbfs>-50;
 const gain=Math.min(1,linear(peakCapDbfs)/before.peak,voiceNonsilent?voiceMetrics.rms*linear(-voiceMarginDb)/before.rms:1);
 const samples=Float32Array.from(shaped,value=>value*gain),after=signalMetrics(samples);
 return{samples,gain,gain_db:db(gain),before,after,voice:voiceMetrics,voice_nonsilent:voiceNonsilent,rms_margin_db:voiceNonsilent?voiceMetrics.rms_dbfs-after.rms_dbfs:null};
}

export function mixSfx({root,planPath,manifestPath,ffmpeg,ffprobe,bedPath,mixPath,reportPath}){
 const plan=JSON.parse(readFileSync(planPath)),manifest=JSON.parse(readFileSync(manifestPath)),selected=validateMixPlan(plan,manifest);
 const within=file=>{const path=resolve(root,file),rel=relative(root,path);if(rel.startsWith('..')||!rel)throw Error('Audio paths must be within the workspace');return path;};
 const voicePath=within(plan.voice_filepath),voiceHash=sha256File(voicePath);
 if(voiceHash!==plan.voice_sha256)throw Error('Narration source hash changed');
 const metadata=JSON.parse(child(ffprobe,['-v','error','-show_streams','-of','json',voicePath]));
 const audio=metadata.streams.filter(s=>s.codec_type==='audio');
 if(audio.length!==1||+audio[0].sample_rate!==plan.sample_rate||audio[0].channels!==1||!audio[0].codec_name.startsWith('pcm_'))throw Error('Narration must be native mono PCM at the declared rate; no resampling permitted');
 const voice=decode(ffmpeg,voicePath),bed=new Float32Array(voice.length),cues=[];
 for(const{cue,asset}of selected){
  const file=within(asset.local_filepath);if(!existsSync(file)||sha256File(file)!==asset.sha256)throw Error(`SFX source hash mismatch: ${cue.asset_id}`);
  const decoded=decode(ffmpeg,file,{sampleRate:plan.sample_rate,mono:true});
  const length=cue.trim_seconds!==undefined?Math.min(decoded.length,Math.round(cue.trim_seconds*plan.sample_rate)):decoded.length;
  const start=Math.round(cue.time*plan.sample_rate);if(start+length>voice.length)throw Error(`Cue exceeds narration authority: ${cue.id}`);
  const result=attenuateCue(decoded.subarray(0,length),voice.subarray(start,start+length),{peakCapDbfs:plan.peak_cap_dbfs,voiceMarginDb:plan.voice_rms_margin_db,fadeInSamples:Math.round((cue.fade_in_seconds??.005)*plan.sample_rate),fadeOutSamples:Math.round((cue.fade_out_seconds??.03)*plan.sample_rate)});
  for(let i=0;i<length;i++)bed[start+i]+=result.samples[i];
  cues.push({id:cue.id,asset_id:asset.asset_id,source:asset.source,source_url:asset.source_url,original_title:asset.original_title,creator:asset.creator,license:asset.license,license_url:asset.license_url,source_filepath:asset.local_filepath,source_sha256:asset.sha256,time_requested:cue.time,start_sample:start,start_seconds:start/plan.sample_rate,sample_count:length,duration_seconds:length/plan.sample_rate,source_duration_seconds:decoded.length/plan.sample_rate,trim_seconds:cue.trim_seconds??null,fade_in_seconds:cue.fade_in_seconds??.005,fade_out_seconds:cue.fade_out_seconds??.03,gain:result.gain,gain_db:result.gain_db,peak_dbfs:result.after.peak_dbfs,rms_dbfs:result.after.rms_dbfs,concurrent_voice_rms_dbfs:result.voice.rms_dbfs,voice_nonsilent:result.voice_nonsilent,rms_margin_db:result.rms_margin_db,auditory_review:'not_performed; metadata and signal screening only'});
 }
 const mixed=Float32Array.from(voice,(value,i)=>value+bed[i]);
 const bedMetrics=signalMetrics(bed),mixedMetrics=signalMetrics(mixed),voiceMetrics=signalMetrics(voice);
 if(bedMetrics.peak_dbfs>plan.peak_cap_dbfs+1e-5)throw Error('Combined SFX bed peak exceeds cap; lower cue gains or avoid overlaps');
 if(mixedMetrics.clipped_samples)throw Error('Mix clips; original narration must remain untouched; reduce SFX instead');
 writeFloatWav(bedPath,bed,plan.sample_rate);writeFloatWav(mixPath,mixed,plan.sample_rate);
 const actualBed=decode(ffmpeg,bedPath),actualMix=decode(ffmpeg,mixPath);
 let residual=0;for(let i=0;i<voice.length;i++)residual=Math.max(residual,Math.abs(actualMix[i]-actualBed[i]-voice[i]));
 const checks=[
  {name:'source-narration-unchanged',pass:sha256File(voicePath)===voiceHash},
  {name:'sample-exact-native-duration',pass:actualBed.length===voice.length&&actualMix.length===voice.length},
  {name:'unity-narration-subtraction',pass:residual<=1.2e-7,tolerance:1.2e-7,maximum_absolute_error:residual},
  {name:'sfx-peak-cap',pass:bedMetrics.peak_dbfs<=plan.peak_cap_dbfs+1e-5},
  {name:'cue-voice-rms-margin',pass:cues.every(c=>!c.voice_nonsilent||c.rms_margin_db>=plan.voice_rms_margin_db-1e-5)},
  {name:'no-hard-clipping',pass:mixedMetrics.clipped_samples===0},
  {name:'licensed-source-assets-unchanged',pass:selected.every(({asset})=>sha256File(within(asset.local_filepath))===asset.sha256)},
 ];
 const report={schema_version:'1.0',status:checks.every(c=>c.pass)?'PASS':'FAIL',music:false,sfx_count:cues.length,narration_gain:1,normalization:false,limiter:false,narration_resampled:false,narration_trimmed:false,narration_source:plan.voice_filepath,narration_sha256:voiceHash,sample_rate:plan.sample_rate,channels:1,sample_count:voice.length,duration_seconds:voice.length/plan.sample_rate,plan_sha256:sha256File(planPath),manifest_sha256:sha256File(manifestPath),outputs:{bed:{path:relative(root,bedPath),sha256:sha256File(bedPath)},mix:{path:relative(root,mixPath),sha256:sha256File(mixPath)}},voice_metrics:voiceMetrics,sfx_metrics:bedMetrics,mix_metrics:mixedMetrics,cues,checks,method:'Decode native narration PCM to float without resampling/gain. Downmix/resample only SFX, apply per-cue fades/attenuation, sum bed into original samples at unity, write float WAV. No amix normalization. Final AAC encoding happens once during delivery mux.',auditory_review_complete:false,limitation:'Level, timing and source checks do not constitute human listening or timbre approval. Private stems/source files must not be redistributed standalone.'};
 mkdirSync(dirname(reportPath),{recursive:true});writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
 if(report.status!=='PASS')throw Error('Mix output validation failed; see report');
 return report;
}
