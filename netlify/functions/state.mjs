import {getStore} from "@netlify/blobs";
import {verify,json} from "../lib/auth.mjs";
export default async req=>{
  const st=getStore("portal");
  if(req.method==="GET")return json(await st.get("state",{type:"json"})||{});
  if(req.method==="POST"){
    if(!verify(req))return json({error:"no autorizado"},401);
    const b=await req.text();
    if(b.length>5e6)return json({error:"muy grande"},413);
    try{JSON.parse(b)}catch{return json({error:"json"},400)}
    await st.set("state",b);return json({ok:true});
  }
  return json({error:"metodo"},405);
};
export const config={path:"/api/state"};
