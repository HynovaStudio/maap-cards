const fs=require('fs'),path=require('path');
const ROOT=__dirname;
const tpl=fs.readFileSync(path.join(ROOT,'template.html'),'utf8');
const shared=JSON.parse(fs.readFileSync(path.join(ROOT,'shared.json'),'utf8'));
const dist=path.join(ROOT,'dist');
try{for(const e of fs.readdirSync(dist))fs.rmSync(path.join(dist,e),{recursive:true,force:true});}catch(e){}
fs.mkdirSync(dist,{recursive:true});
const slugify=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const files=fs.readdirSync(ROOT).filter(f=>/^person-.*\.json$/i.test(f)&&!/^person-_/.test(f));
const cards=[];
for(const f of files){
  const person=JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
  const CARD=Object.assign({},shared,person);
  if(!CARD.whatsappPrefill)CARD.whatsappPrefill=`Hi ${CARD.firstName}, I found your details on the MAAP digital card.`;
  const slug=CARD.slug||slugify(`${CARD.firstName}-${CARD.lastName}`);
  const outDir=path.join(dist,slug);fs.mkdirSync(outDir,{recursive:true});
  if(CARD.photo&&!/^https?:/i.test(CARD.photo)){const src=path.join(ROOT,'assets',CARD.photo);if(fs.existsSync(src))fs.copyFileSync(src,path.join(outDir,CARD.photo));else CARD.photo="";}
  fs.writeFileSync(path.join(outDir,'index.html'),tpl.replace('__CARD_DATA__',JSON.stringify(CARD,null,2)));
  cards.push({slug,name:`${CARD.firstName} ${CARD.lastName}`.trim(),role:CARD.role||''});
  console.log('  built /'+slug);
}
const list=cards.map(c=>`<a class="c" href="./${c.slug}/"><b>${c.name}</b><span>${c.role}</span></a>`).join('');
fs.writeFileSync(path.join(dist,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAAP Digital Cards</title><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet"><style>body{font-family:Roboto,system-ui,sans-serif;background:#09172D;color:#fff;margin:0;min-height:100vh;padding:48px 16px;display:flex;flex-direction:column;align-items:center}h1{font-weight:900;letter-spacing:6px;margin:0}h1 span{color:#F8AD40}.t{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.6);margin:6px 0 26px}.c{display:flex;flex-direction:column;gap:3px;width:100%;max-width:380px;padding:16px 20px;margin:7px 0;border-radius:14px;background:#102541;border:1px solid rgba(255,255,255,.1);color:#fff;text-decoration:none}.c b{font-size:16px}.c span{color:#F8AD40;font-size:12px}</style></head><body><h1>MA<span>A</span>P</h1><div class="t">Digital Cards</div>${list||'<p>No cards yet.</p>'}</body></html>`);
console.log(`\n✓ ${cards.length} card(s) built`);
