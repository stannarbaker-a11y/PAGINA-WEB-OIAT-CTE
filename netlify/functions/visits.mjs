import {getStore} from "@netlify/blobs";
import {json} from "../lib/auth.mjs";
export default async req=>{
  const st=getStore("portal");let n=+(await st.get("visits"))||0;
  if(req.method==="POST"){n++;await st.set("visits",String(n))}
  return json({n});
};
export const config={path:"/api/visits"};
