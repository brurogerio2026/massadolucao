import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { status,connect,disconnect } from "./mercadopago.server";
async function admin(c:{supabase:any;userId:string}){const {data,error}=await c.supabase.rpc("has_role",{_user_id:c.userId,_role:"admin"});if(error||!data)throw new Error("Acesso administrativo não autorizado.");}
export const getMercadoPagoConnectionStatus=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{await admin(context);return status();});
export const saveMercadoPagoCredentials=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>z.object({environment:z.enum(["test","production"]),accessToken:z.string().max(1000).optional().or(z.literal("")),publicKey:z.string().max(500).optional().or(z.literal("")),webhookSecret:z.string().max(1000).optional().or(z.literal(""))}).parse(x)).handler(async({context,data})=>{await admin(context);return connect({environment:data.environment,value:data.accessToken,publicKey:data.publicKey,webhookSecret:data.webhookSecret,userId:context.userId});});
export const disconnectMercadoPagoConnection=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>z.object({confirm:z.literal(true)}).parse(x)).handler(async({context})=>{await admin(context);await disconnect();return {ok:true};});
