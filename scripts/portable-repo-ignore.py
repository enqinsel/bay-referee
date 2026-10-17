#!/usr/bin/env python3
"""Merge folder-scoped exclusions for reviewed local groups; preserve unknown files."""
from pathlib import Path
import importlib.util, json
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('policy',ROOT/'scripts/portable-repo-manifest.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
inv=json.loads((ROOT/'docs/portable-repository-v1/inventory.json').read_text())
entries={x['path']:x for x in inv['files']};entries.update({x['path']:x for x in p.walk()})
tree={}
for rel,e in entries.items():
    cursor=tree
    for part in rel.split('/')[:-1]:cursor=cursor.setdefault(part,{})
    cursor[rel.split('/')[-1]]=p.classify(rel,e.get('type','file'))[0]
KEEP={'REQUIRED_IN_GIT','REQUIRED_BUT_LFS_CANDIDATE','REVIEW_REQUIRED'}
def kept(value):return value in KEEP if isinstance(value,str) else any(kept(x) for x in value.values())
rules=[]
def descend(node,base=''):
    for name,value in sorted(node.items()):
        rel=f'{base}/{name}' if base else name
        if rel=='.git':continue
        if not kept(value):rules.append('/'+rel+('/' if isinstance(value,dict) else ''))
        elif isinstance(value,dict):descend(value,rel)
descend(tree)
begin='# BEGIN BAY REFEREE PORTABLE REPOSITORY V1'
end='# END BAY REFEREE PORTABLE REPOSITORY V1'
f=ROOT/'.gitignore';original=f.read_text();original=original.split(begin)[0].rstrip()+'\n'
# Broad old substring bans also hid the requested secret-audit report. Use concrete secret paths.
original=original.replace('*credentials*\n','').replace('*secret*\n','')
explicit=['/.secrets/','/.aws/','/credentials.json','/credentials/','/videolar/','**/_work/','/tmp/','/temp/','/checkpoints/','/models/cache/']
text=original+'\n'+begin+'\n# Known archive/dependency/private groups; originals remain in place.\n'+'\n'.join(dict.fromkeys(explicit+rules))+'\n'+end+'\n'
f.write_text(text)
report=ROOT/'docs/portable-repository-v1/gitignore-review.md'
report.write_text('# .gitignore review\n\nOriginal dependency/cache/output rules were retained. Existing `*secret*` and `*credentials*` substring bans were replaced with explicit secret paths because they also hid legitimate audit documentation. No global PNG/WAV/MP4 extension ban was added.\n\nThe added block is derived from reviewed classifications, collapsing a directory only when every inventoried descendant is local-only. Unknown REVIEW_REQUIRED paths are not ignored automatically. New source must be added to the portable manifest policy and checked before any commit.\n\n`videolar/`, `_work/`, dependencies, downloaded tools/models, historical labs, raw identity/voice, provider records and licensed audio remain local. Approved avatar/brand PNGs and fonts remain trackable.\n\nExisting Git history is empty; ignore does not rewrite history. This phase did not change the original index.\n\nExact added rules:\n\n```gitignore\n'+'\n'.join(dict.fromkeys(explicit+rules))+'\n```\n')
print(json.dumps({'status':'MERGED','rules':len(set(explicit+rules)),'global_media_extension_ban_added':False}))
