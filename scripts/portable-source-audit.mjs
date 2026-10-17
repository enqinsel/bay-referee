import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const secretPatterns=[
  ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['provider-key',/\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})\b/g],
  ['bearer-value',/\bBearer\s+[A-Za-z0-9._~+\/-]{24,}/gi],
  ['credential-assignment',/(?:api[_-]?key|access[_-]?token|auth[_-]?token|session[_-]?(?:id|cookie)|password)\s*["']?\s*[:=]\s*["'][A-Za-z0-9_./+=-]{20,}["']/gi],
  ['private-provider-url',/https?:\/\/[^\s"'<>]*(?:cloudfront\.net\/user_|[?&](?:token|signature|x-amz-signature|expires)=)[^\s"'<>]*/gi],
];
export function scanText(text){
  const hits=[];
  for(const [issue,pattern] of secretPatterns){pattern.lastIndex=0;for(const match of text.matchAll(pattern)){hits.push({issue,line:text.slice(0,match.index).split('\n').length});}}
  return hits;
}
export function auditCandidates(root=projectRoot){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/portable-repo-manifest.json'),'utf8'));
  const issues=[],files=[],absoluteRuntime=[],casefold=new Map();
  for(const entry of manifest.candidates){
    const p=entry.path,full=path.join(root,p),stat=fs.lstatSync(full);
    if(stat.isSymbolicLink())issues.push({path:p,issue:'source-symlink'});
    if(stat.size>100*1024**2)issues.push({path:p,issue:'over-100MiB-hard-review'});
    if(p.startsWith('voice/reference/')||p.includes('/provenance/user-identity-reference')||/^\.env(?:\.|$)/.test(p)&&p!=='.env.example')issues.push({path:p,issue:'private-source-path'});
    const folded=p.normalize('NFC').toLocaleLowerCase('en-US');
    if(casefold.has(folded)&&casefold.get(folded)!==p)issues.push({path:p,issue:'case-or-unicode-collision'});
    casefold.set(folded,p);
    const data=fs.readFileSync(full);files.push({path:p,sha256:crypto.createHash('sha256').update(data).digest('hex'),bytes:stat.size});
    if(!/\.(?:mjs|js|py|json|md|txt|css|html|svg|yaml|toml)$/.test(p)&&!['.npmrc','.env.example'].includes(p))continue;
    const text=data.toString('utf8');
    for(const hit of scanText(text))issues.push({path:p,...hit});
    if(/\.(?:mjs|js|py)$/.test(p)&&!p.startsWith('tests/')){
      const re=/\/Users\/[^/\s"'`]+\//g;
      for(const m of text.matchAll(re))absoluteRuntime.push({path:p,line:text.slice(0,m.index).split('\n').length,issue:'absolute-home-runtime'});
    }
  }
  return {status:issues.length||absoluteRuntime.length?'REVIEW_NEEDED':'PASS',files_scanned:files.length,issues,absolute_runtime: absoluteRuntime,large_candidates:files.filter(f=>f.bytes>25*1024**2),candidate_set_sha256:crypto.createHash('sha256').update(files.map(f=>f.path+'\0'+f.sha256).join('\n')).digest('hex'),limitation:'Pattern scan supplements classification and manual review; it cannot prove absence of every secret.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=auditCandidates();const arg=process.argv.indexOf('--report');
  if(arg>=0)fs.writeFileSync(path.resolve(process.argv[arg+1]),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='PASS'?0:1;
}
