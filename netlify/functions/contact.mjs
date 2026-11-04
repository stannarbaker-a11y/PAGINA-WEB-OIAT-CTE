import {getStore} from "@netlify/blobs";
import {json} from "../lib/auth.mjs";
export default async req=>{
  if(req.method!=="POST")return json({error:"metodo"},405);
  const {email="",msg="",hp=""}=await req.json().catch(()=>({}));
  if(hp)return json({ok:true});
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||msg.trim().length<5||msg.length>3000)return json({error:"datos"},400);
  const st=getStore("portal");
  if(Date.now()-(+(await st.get("contactAt"))||0)<3e4)return json({error:"espera"},429);
  await st.set("contactAt",String(Date.now()));
  const r=await fetch("https://api.resend.com/emails",{method:"POST",
    headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"content-type":"application/json"},
    body:JSON.stringify({from:"Portal <onboarding@resend.dev>",to:[process.env.RESET_EMAIL||"stannarbaker@gmail.com"],reply_to:email,
      subject:"Mensaje desde el portal",text:"De: "+email+"\n\n"+msg})});
  return r.ok?json({ok:true}):json({error:"correo"},502);
};
export const config={path:"/api/contact"};
