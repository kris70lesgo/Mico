import type {MicoProgress} from './mico-progress';

const env=(import.meta as ImportMeta & {env?:Record<string,string|undefined>}).env;
export const syncStatus=()=>env?.VITE_SUPABASE_URL&&env?.VITE_SUPABASE_PUBLISHABLE_KEY?'configured':'local';
export type CloudProfile=Pick<MicoProgress,'xp'|'hearts'|'streak'|'dailyXp'|'lastActive'|'completed'|'mastery'|'weak'>;
export const toCloudProfile=(progress:MicoProgress):CloudProfile=>({xp:progress.xp,hearts:progress.hearts,streak:progress.streak,dailyXp:progress.dailyXp,lastActive:progress.lastActive,completed:progress.completed,mastery:progress.mastery,weak:progress.weak});
