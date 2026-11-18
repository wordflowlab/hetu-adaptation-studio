from pathlib import Path
import json,hashlib,struct,subprocess
root=Path.cwd();peers=json.loads((root/'acceptance-lock.json').read_text())['peers']
for peer in peers:
 p=root.parent/('hetu-'+peer['slug']);assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=p,text=True).strip()==peer['git_sha']
 for command in [['npm','ci'],['npm','run','build'],['npm','run','check'],['npm','run','test:unit']]:subprocess.run(command,cwd=p,check=True)
 h=hashlib.sha256()
 for f in sorted((p/'dist').rglob('*'),key=lambda f:f.relative_to(p/'dist').as_posix().encode()):
  if f.is_file():n=f.relative_to(p/'dist').as_posix().encode();b=f.read_bytes();h.update(struct.pack('>IQ',len(n),len(b))+n+b)
 assert h.hexdigest()==peer['package_sha256'],peer['slug']
 print(peer['slug'],h.hexdigest(),flush=True)
