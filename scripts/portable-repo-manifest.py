#!/usr/bin/env python3
"""Curate the portable source set. No Git index changes, removals, or network calls."""
from pathlib import Path
from collections import Counter, defaultdict
import argparse, hashlib, json, os

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/portable-repository-v1'
ROOT_FILES = {'.gitignore','.npmrc','.env.example','.node-version','.python-version','README.md','package.json','package-lock.json','requirements-lock-macos-arm64.txt','requirements-whisper.txt','requirements-production.txt'}
SCRIPTS = {'runtime.mjs','setup.mjs','python.mjs','hyperframes.mjs','doctor.mjs','new_episode.py','validate_episode.py','transcribe.py','probe.mjs','render-smoke.mjs','smoke.mjs','bay-referee-new-episode.mjs','setup-bay-referee.mjs','skill-sync.mjs','bay-referee-assets.mjs'}
TESTS = {'bay-referee-new-episode.test.mjs','test-portable-production.mjs','test_transcription.py','test_episode.py','test_planning.py','test_local_commands.py','test_motion_stability.mjs','test_editorial_state.mjs','test_visual_state_density.mjs','publication-gate.test.mjs','captions-v3.test.mjs'}
EXACT = {'voice/decision.json','voice/pronunciation/tr-football.json','brand/bay-referee/avatar/placement.json','brand/bay-referee/outro/pose-semantic-contract.json','brand/bay-referee/motion-research/consolidation-decision.json','formats/football-comparison-v1/system/grammar.mjs','formats/football-comparison-v1/system/components.mjs','formats/football-comparison-v2/system/football-world.mjs','formats/football-production-kit-v1/system/caption-style.json','mascot/engin-avatar-v1/master/master-identity.png'}
PREFIXES = ('config/','schemas/','episodes/_template/','brand/bay-referee/channel-skill/','brand/bay-referee/production-template/','brand/bay-referee/avatar/poses/','brand/bay-referee/avatar/master/','brand/bay-referee/brand-bug/','brand/bay-referee/profile/','brand/bay-referee/watermark/','brand/bay-referee/wordmark/','brand/bay-referee/tokens/','formats/football-comparison-v1/fonts/')
LOCAL_REPORTS = {'inventory.json','git-history.json','classification-index.jsonl','candidate-files.txt','clean-clone-path.txt','clean-clone.log','setup-local.json','preservation-baseline.json','preservation-after.json'}

def selected(p):
    parts=p.split('/')
    if p in ROOT_FILES or p in EXACT:return True
    if parts[0]=='scripts':return len(parts)==2 and (parts[1] in SCRIPTS or parts[1].startswith(('portable-','skill-')))
    if parts[0]=='tests':return len(parts)==2 and (parts[1] in TESTS or parts[1].startswith('portable-'))
    if p.startswith('docs/'):
        return '__pycache__' not in parts and (len(parts)==2 and p.endswith(('.md','.json')) or p.startswith('docs/portable-repository-v1/') and parts[-1] not in LOCAL_REPORTS and p.endswith(('.md','.json','.txt')))
    if p.startswith('engine/'):
        return not any(x in parts for x in ('__pycache__','demo','vendor','snapshots','.hyperframes','.hyperframe')) and not p.startswith(('engine/assets/sfx/','engine/qa/overlays/','engine/assets/treatments/','engine/design-system/examples/')) and p.endswith(('.mjs','.js','.py','.json','.md','.css','.html','.svg','.txt'))
    if any(p.startswith(x) for x in PREFIXES):
        return not any(x in parts for x in ('qa','provenance','raws','__pycache__')) and parts[-1]!='.DS_Store'
    return False

def classify(p, kind='file'):
    parts=p.split('/')
    if p.startswith(('voice/reference/','mascot/engin-avatar-v1/provenance/','brand/bay-referee/avatar/provenance/','voice/higgsfield/')):
        return 'SECRET_OR_PRIVATE','Raw identity/clone evidence or provider job/download records; retained only locally.',False,'Not needed: use approved transformed avatar and authorized Engin connector voice.'
    if parts[-1].startswith('.env') and parts[-1]!='.env.example' or any(x in parts for x in ('.secrets','.aws')):
        return 'SECRET_OR_PRIVATE','Local secret/configuration material; never copied by portable exporter.',False,'Connect the official provider on each machine; no credential copies.'
    if kind=='symlink':return 'LOCAL_REGENERATABLE','Machine-local link, never followed or exported.',False,'Run node scripts/setup-bay-referee.mjs'
    if any(x in parts for x in ('node_modules','.venv','.cache','__pycache__')) or p.startswith(('.tools/','.git/','voice/chatterbox/env/','voice/chatterbox/cache/','voice/chatterbox/model/')) or parts[-1]=='.DS_Store' or p.endswith(('.pyc','.log','.tmp','.partial')):
        return 'LOCAL_REGENERATABLE','Dependency, downloaded tool/model, cache, OS metadata or local Git administration.',True,'Run node scripts/setup-bay-referee.mjs; models remain in local cache.'
    if p.startswith('docs/portable-repository-v1/') and parts[-1] in LOCAL_REPORTS:
        return 'LOCAL_REGENERATABLE','Machine-specific exhaustive audit/test inventory; compact review reports are in source.',False,'Re-run portable audit/export locally; not needed for production.'
    if selected(p):
        if p.endswith(('.png','.ttf')):
            return 'REQUIRED_BUT_LFS_CANDIDATE','Approved transformed reusable visual/font; normal Git chosen at current small size.',True,'Preserve exact source bytes from repository.'
        return 'REQUIRED_IN_GIT','Reusable runtime, locked authority, schema, template, test or reviewed setup documentation.',True,'Restore through Git; run setup for dependencies.'
    if p.startswith('audio/sfx/'):
        return 'LOCAL_REGENERATABLE','Licensed sound library/raws and historic review data are not distributed with source; safe metadata is in config/bay-referee-portable-assets.json.',True,'node scripts/bay-referee-assets.mjs --help; acquire licensed bytes locally and verify hashes.'
    if p.startswith('brand/bay-referee/outro/audio/'):
        return 'LOCAL_REGENERATABLE','Standalone licensed whistle derivatives excluded from source bundles as well as originals.',True,'Use local licensed source and the approved closure recipe in portable production module.'
    if p.startswith(('videolar/','renders/','brand/bay-referee/production/')) or '_work' in parts:
        return 'LOCAL_PRODUCTION_OUTPUT','Episode output, render or work products. Retained locally, synchronized outside Git if needed.',False,'Produce only within an authorized episode; transfer final package through shared storage.'
    if parts[0] in {'brand','formats','mascot','episodes','qa','research','references','sfx-review','voice','scripts','tests','engine'}:
        return 'R&D_ARCHIVE','Historic lab/pilot, deprecated helper, optional experimental subsystem or generated evidence outside the portable production closure. Preserve in place.',False,'No rebuild needed on second machine; optional manual archive transfer after separate review.'
    return 'REVIEW_REQUIRED','Unrecognized source group: no automatic ignore or export recommendation.',None,'Human classification required before adding or excluding.'

def walk():
    result=[]
    for parent,dirs,files in os.walk(ROOT,followlinks=False):
        # Dependency trees are counted from the immutable before inventory, not rescanned after restore.
        dirs[:]=[d for d in dirs if not (Path(parent)/d).is_symlink() and d not in ('node_modules','.venv','.cache','.git')]
        for name in files:
            p=Path(parent)/name;rel=p.relative_to(ROOT).as_posix()
            st=p.lstat();result.append({'path':rel,'bytes':st.st_size,'type':'symlink' if p.is_symlink() else 'file'})
    return result

def main():
    REPORT.mkdir(parents=True,exist_ok=True)
    inventory_path=REPORT/'inventory.json'
    before=json.loads(inventory_path.read_text()) if inventory_path.exists() else None
    entries={x['path']:{k:x[k] for k in ('path','bytes','type')} for x in before['files']} if before else {}
    entries.update({x['path']:x for x in walk()})
    groups=defaultdict(lambda:{'estimated_bytes':0,'files':0});candidates=[];review=[];counts=Counter();sizes=Counter();rows=[]
    for p,e in sorted(entries.items()):
        cls,reason,need,rebuild=classify(p,e['type']);track=cls in ('REQUIRED_IN_GIT','REQUIRED_BUT_LFS_CANDIDATE')
        row={**e,'classification':cls,'tracked_recommendation':track,'lfs_recommendation':False,'reason':reason,'second_machine_need':need,'bootstrap_or_rebuild':rebuild}
        rows.append(row);counts[cls]+=1;sizes[cls]+=e['bytes']
        # Stable, granular groups by exact selected file and three path components for exclusions.
        group=p if track else '/'.join(p.split('/')[:3])
        g=groups[(group,cls)];g.update({'path':group,'classification':cls,'tracked_recommendation':track,'lfs_recommendation':False,'reason':reason,'second_machine_need':need,'bootstrap_or_rebuild':rebuild});g['estimated_bytes']+=e['bytes'];g['files']+=1
        if track:
            actual=ROOT/p
            if actual.is_file():candidates.append({'path':p,'bytes':actual.stat().st_size,'classification':cls,'sha256':hashlib.sha256(actual.read_bytes()).hexdigest() if not p.startswith('docs/portable') else None})
        elif cls=='REVIEW_REQUIRED':review.append(row)
    # Dependencies are never part of the candidate list; source export uses explicit paths.
    output={'schema':'bay-referee-portable-manifest-v1','snapshot_date':'2026-10-17','policy':'scripts/portable-repo-manifest.py','lfs_recommended':False,'lfs_reason':'Approved source binaries total only a few tens of MB; no candidate approaches the 25MiB warning threshold. Re-evaluate LFS only if reusable binary sources grow. Licensed SFX are excluded from Git and LFS.','thresholds_bytes':{'warning':25*1024**2,'hard_review':100*1024**2},'original_workspace':before['summary'] if before else None,'source_worktree_bytes':sum(x['bytes'] for x in candidates),'source_file_count':len(candidates),'proposed_lfs_bytes':0,'proposed_lfs_files':0,'local_only_snapshot_bytes':sum(e['bytes'] for e in (before['files'] if before else entries.values()) if e['type']=='file' and classify(e['path'],e['type'])[0] not in ('REQUIRED_IN_GIT','REQUIRED_BUT_LFS_CANDIDATE')),'classification_totals':[{ 'classification':k,'files':counts[k],'bytes':sizes[k]} for k in sorted(counts)],'groups':sorted(groups.values(),key=lambda g:(g['classification'],g['path'])),'candidates':candidates,'largest_tracked_candidates':sorted(candidates,key=lambda x:x['bytes'],reverse=True)[:30],'review_required':review,'notes':['Before-workspace totals are the immutable inventory snapshot; generated audit/clone files do not pretend to be original content.','Source size is logical bytes, not Git pack or clone dependency size.','Classification B records that binaries were evaluated for LFS; LFS recommendation is independently false.','File paths and hashes are evidence, not permission to publish.']}
    text=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
    (REPORT/'manifest.json').write_text(text);(ROOT/'docs/portable-repo-manifest.json').write_text(text)
    (REPORT/'candidate-files.txt').write_text('\n'.join(x['path'] for x in candidates)+'\n')
    with (REPORT/'classification-index.jsonl').open('w') as f:
        for row in rows:f.write(json.dumps(row,ensure_ascii=False)+'\n')
    heading='# BAY REFEREE Portable Repository V1 — Manifest\n\n'
    summary=f"Proposed source worktree: **{output['source_worktree_bytes']/1024**2:.2f} MiB / {len(candidates)} files**. Git LFS: **not recommended, 0 bytes**. This is a candidate set; no files were staged, committed or pushed in the original repository.\n\n"
    table='| Path / group | Classification | Size | Git | LFS | Second machine / rebuild |\n|---|---|---:|---|---|---|\n'
    # All granular classifications are in JSON; readable report lists source roots and major exclusions.
    for key in sorted({x['path'].split('/')[0] for x in candidates}):
        vals=[x for x in candidates if x['path'].split('/')[0]==key]
        table+=f"| `{key}` ({len(vals)} files) | REQUIRED_IN_GIT / source binaries | {sum(x['bytes'] for x in vals)/1024**2:.2f} MiB | yes | no | Restore Git, then setup |\n"
    body=heading+summary+table+'\nExact paths, reasons, sizes, classification, second-machine need and rebuild method are in [manifest.json](manifest.json). Exhaustive local machine entries are in `classification-index.jsonl` and are not Git candidates.\n\n## Local-only policy\n\nDependencies and model/tool caches are rebuilt. `videolar/` and old production renders use shared storage/manual archives. Historical labs stay in place. Raw identity/voice references and provider records never enter Git. Licensed stock sounds are obtained locally with hash and license checks. Unknown paths remain REVIEW_REQUIRED rather than being silently ignored.\n'
    (REPORT/'manifest.md').write_text(body)
    (ROOT/'docs/portable-repo-manifest.md').write_text(body.replace('[manifest.json](manifest.json)','[manifest.json](portable-repo-manifest.json)'))
    print(json.dumps({'candidates':len(candidates),'bytes':output['source_worktree_bytes'],'review_required':len(review)}))

if __name__=='__main__':main()
