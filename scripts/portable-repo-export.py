#!/usr/bin/env python3
"""Copy only the reviewed source manifest into a new local directory. No remote/Git mutation."""
from pathlib import Path
import argparse, hashlib, json, shutil, importlib.util

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('portable_policy',ROOT/'scripts/portable-repo-manifest.py')
policy=importlib.util.module_from_spec(spec);spec.loader.exec_module(policy)

def export(destination):
    requested=Path(destination).expanduser()
    if '..' in requested.parts:raise ValueError('Destination traversal is not allowed.')
    absolute=requested.absolute()
    if any(parent.is_symlink() for parent in (absolute,*absolute.parents)):
        raise ValueError('Destination symlink or symlink ancestor is not allowed; use its physical path.')
    dest=absolute.resolve(strict=False)
    if dest.exists() or dest.is_symlink():raise ValueError('Destination must be new; existing trees are never overwritten.')
    if dest==ROOT.resolve() or ROOT.resolve() in dest.parents:raise ValueError('Keep the clean source export outside the live engine.')
    manifest=json.loads((ROOT/'docs/portable-repo-manifest.json').read_text())
    entries=manifest['candidates'];seen=set();plan=[]
    for entry in entries:
        rel=entry['path'];parts=Path(rel).parts
        if rel in seen or Path(rel).is_absolute() or '..' in parts:raise ValueError('Unsafe or duplicate manifest path')
        seen.add(rel);source=ROOT/rel
        if any((ROOT/Path(*parts[:i])).is_symlink() for i in range(1,len(parts)+1)):raise ValueError('Source symlink refused: '+rel)
        if not source.is_file() or not policy.selected(rel):raise ValueError('File outside source policy: '+rel)
        if policy.classify(rel)[0] not in ('REQUIRED_IN_GIT','REQUIRED_BUT_LFS_CANDIDATE'):raise ValueError('Non-source classification: '+rel)
        payload=source.read_bytes();digest=hashlib.sha256(payload).hexdigest()
        if entry.get('sha256') and digest!=entry['sha256']:raise ValueError('Manifest stale; refresh before export: '+rel)
        plan.append((rel,source,digest,payload,source.stat().st_mode & 0o777))
    dest.mkdir(parents=True,exist_ok=False)
    copied=[]
    for rel,source,digest,payload,mode in plan:
        target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True)
        with target.open('xb') as stream:stream.write(payload)
        target.chmod(mode)
        if hashlib.sha256(target.read_bytes()).hexdigest()!=digest:raise RuntimeError('Copy verification failed: '+rel)
        copied.append({'path':rel,'sha256':digest,'bytes':target.stat().st_size})
    return {'status':'SOURCE_EXPORT_PASS','destination':str(dest),'files':len(copied),'bytes':sum(x['bytes'] for x in copied),'copied':copied,'network_calls':0,'original_git_modified':False}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--destination',required=True);parser.add_argument('--report');args=parser.parse_args()
    result=export(args.destination)
    if args.report:Path(args.report).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='copied'}))
