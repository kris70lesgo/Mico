import type {MicoProgress} from './mico-progress';
import {supabase} from './supabase';

const env=(import.meta as ImportMeta & {env?:Record<string,string|undefined>}).env;
export const syncStatus=()=>env?.VITE_SUPABASE_URL&&env?.VITE_SUPABASE_PUBLISHABLE_KEY?'configured':'local';
export type CloudProfile=Pick<MicoProgress,'xp'|'hearts'|'streak'|'dailyXp'|'lastActive'|'completed'|'mastery'|'weak'>;
export const toCloudProfile=(progress:MicoProgress):CloudProfile=>({xp:progress.xp,hearts:progress.hearts,streak:progress.streak,dailyXp:progress.dailyXp,lastActive:progress.lastActive,completed:progress.completed,mastery:progress.mastery,weak:progress.weak});

type ProgressRow={xp:number;hearts:number;streak:number;daily_xp:number;last_active:string;completed_lessons:unknown;mastery:unknown;weak_topics:unknown};
const asRecord=(value:unknown):Record<string,number>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,number>:{};
const asStrings=(value:unknown):string[]=>Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'):[];
export const fromCloudProgress=(row:ProgressRow):MicoProgress=>({xp:row.xp,hearts:row.hearts,streak:row.streak,dailyXp:row.daily_xp,lastActive:new Date(`${row.last_active}T00:00:00`).toDateString(),completed:asStrings(row.completed_lessons),mastery:asRecord(row.mastery),weak:asStrings(row.weak_topics)});

export async function loadCloudProgress(userId:string){
 if(!supabase)return null;
 const {data,error}=await supabase.from('learning_progress').select('xp, hearts, streak, daily_xp, last_active, completed_lessons, mastery, weak_topics').eq('user_id',userId).maybeSingle();
 if(error)throw error;
 return data?fromCloudProgress(data as ProgressRow):null;
}

export async function saveCloudProgress(userId:string,progress:MicoProgress){
 if(!supabase)return;
 const {error}=await supabase.from('learning_progress').update({xp:progress.xp,hearts:progress.hearts,streak:progress.streak,daily_xp:progress.dailyXp,last_active:new Date(progress.lastActive).toISOString().slice(0,10),completed_lessons:progress.completed,mastery:progress.mastery,weak_topics:progress.weak}).eq('user_id',userId);
 if(error)throw error;
}

export async function recordLessonAttempt(userId:string,attempt:{lessonId:string;activityId:string;activityKind:string;correct:boolean;answer?:unknown}){
 if(!supabase)return;
 await supabase.from('lesson_attempts').insert({user_id:userId,lesson_id:attempt.lessonId,activity_id:attempt.activityId,activity_kind:attempt.activityKind,correct:attempt.correct,answer:attempt.answer??null});
}

export async function recordLessonCompletion(userId:string,lessonId:string,score:number){
 if(!supabase)return;
 await supabase.from('lesson_completions').upsert({user_id:userId,lesson_id:lessonId,best_score:score,completed_at:new Date().toISOString()},{onConflict:'user_id,lesson_id'});
}

export async function purchaseShopItem(sku:string){
 if(!supabase)throw new Error('Mico is not connected.');
 const {data,error}=await supabase.rpc('purchase_shop_item',{p_sku:sku}).single();
 if(error)throw error;
 return data as {xp:number;hearts:number;item_quantity:number};
}
