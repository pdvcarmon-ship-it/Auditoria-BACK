// Backend mínimo en Render: proxy a SIGPAC (evita CORS). Todo lo demás va en el front.
const express=require('express'),cors=require('cors');
const app=express();
app.use(cors({origin:process.env.FRONT_ORIGIN||'*'}));
const BASE='https://sigpac-hubcloud.es/servicioconsultassigpac/query';
app.get('/',(_,r)=>r.send('ok'));
app.get('/sigpac/*',async(req,res)=>{
 const parts=req.params[0].split('/').filter(Boolean);
 if(parts.length<6||!parts.every(p=>/^\d+$/.test(p)))return res.status(400).json({error:'ref inválida'});
 const path=parts.length>=7?`recinfo/${parts.slice(0,7).join('/')}`:`recinfoparc/${parts.slice(0,6).join('/')}`;
 try{
  const r=await fetch(`${BASE}/${path}.geojson`);
  if(!r.ok)return res.status(r.status).json({error:'SIGPAC no responde'});
  res.set('Cache-Control','public,max-age=86400').json(await r.json());
 }catch(e){res.status(502).json({error:e.message})}
});
app.listen(process.env.PORT||3000);
