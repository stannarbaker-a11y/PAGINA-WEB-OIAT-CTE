import crypto from "node:crypto";
const sec=()=>process.env.SESSION_SECRET||"";
const mac=p=>crypto.createHmac("sha256",sec()).update(p).digest("base64url");
export const sign=()=>{const p=Buffer.from(JSON.stringify({exp:Date.now()+8*36e5})).toString("base64url");return p+"."+mac(p)};
export const eq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
export const verify=req=>{const[p,s]=(req.headers.get("authorization")||"").replace("Bearer ","").split(".");if(!p||!s||!sec()||!eq(mac(p),s))return false;try{return JSON.parse(Buffer.from(p,"base64url")).exp>Date.now()}catch{return false}};
export const hash=(pw,salt)=>crypto.scryptSync(pw,salt,32).toString("hex");
export const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
