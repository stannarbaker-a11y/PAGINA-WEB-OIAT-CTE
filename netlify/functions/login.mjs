import {getStore} from "@netlify/blobs";
import {sign,hash,eq,json} from "../lib/auth.mjs";
export default async req=>{
  if(req.method!=="POST")return json({error:"metodo"},405);
  const {u="",p=""}=await req.json().catch(()=>({}));
  const ov=await getStore("portal").get("pw",{type:"json"});
  const E=process.env;
  const userOk=!!E.ADMIN_USER&&eq(u.trim(),E.ADMIN_USER);
  const passOk=(!!E.ADMIN_PASS&&eq(p,E.ADMIN_PASS))||(!!ov&&eq(hash(p,ov.salt),ov.hash));
  if(!userOk||!passOk){await new Promise(r=>setTimeout(r,800));return json({error:"credenciales"},401)}
  return json({token:sign()});
};
export const config={path:"/api/login"};
