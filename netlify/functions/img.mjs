import {getStore} from "@netlify/blobs";
import {verify,json} from "../lib/auth.mjs";
export default async req=>{
  const id=(new URL(req.url).searchParams.get("id")||"").replace(/[^a-z0-9-]/gi,"").slice(0,60);
  if(!id)return json({error:"id"},400);
  const st=getStore("portal"),k="img-"+id;
  if(req.method==="POST"){
    if(!verify(req))return json({error:"no autorizado"},401);
    const b=await req.text();
    if(b.length>2e6||!/^[A-Za-z0-9+/=]+$/.test(b))return json({error:"imagen"},400);
    await st.set(k,b);
    if(id.startsWith("car-")&&process.env.SHEETS_URL){
      try{await fetch(process.env.SHEETS_URL,{method:"POST",redirect:"follow",headers:{"content-type":"text/plain"},
        body:JSON.stringify({clave:process.env.SHEETS_KEY,foto:new URL(req.url).origin+"/api/img?id="+id})})}catch{}
    }
    return json({ok:true});
  }
  const b=await st.get(k);
  if(!b)return new Response("no existe",{status:404});
  return new Response(Buffer.from(b,"base64"),{headers:{"content-type":"image/jpeg","cache-control":"public, max-age=31536000, immutable"}});
};
export const config={path:"/api/img"};
