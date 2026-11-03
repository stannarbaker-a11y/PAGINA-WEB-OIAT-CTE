import crypto from "node:crypto";
import {getStore} from "@netlify/blobs";
import {hash,json} from "../lib/auth.mjs";
export default async req=>{
  if(req.method!=="POST")return json({error:"metodo"},405);
  const st=getStore("portal");
  if(Date.now()-(+(await st.get("resetAt"))||0)<6e5)return json({error:"espera"},429);
  await st.set("resetAt",String(Date.now()));
  const pw=crypto.randomBytes(9).toString("base64url"),salt=crypto.randomBytes(8).toString("hex");
  const r=await fetch("https://api.resend.com/emails",{method:"POST",
    headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"content-type":"application/json"},
    body:JSON.stringify({from:"Portal <onboarding@resend.dev>",to:[process.env.RESET_EMAIL||"stannarbaker@gmail.com"],
      subject:"Contraseña temporal del portal",text:"Tu contraseña temporal es: "+pw+"\nUsuario: el de siempre."})});
  if(!r.ok)return json({error:"correo"},502);
  await st.set("pw",JSON.stringify({salt,hash:hash(pw,salt)}));
  return json({ok:true});
};
export const config={path:"/api/reset"};
