export type MicoProgress={xp:number;hearts:number;streak:number;dailyXp:number;lastActive:string;completed:string[];mastery:Record<string,number>;weak:string[]};
const key='mico-progress-v1';
export const initialProgress:MicoProgress={xp:240,hearts:5,streak:4,dailyXp:20,lastActive:new Date().toDateString(),completed:[],mastery:{Heart:28},weak:['Heart chambers','Body planes','Cranial nerves']};
export function loadProgress():MicoProgress{try{return {...initialProgress,...JSON.parse(localStorage.getItem(key)??'{}')};}catch{return initialProgress;}}
export function saveProgress(value:MicoProgress){localStorage.setItem(key,JSON.stringify(value));}
export function levelFor(xp:number){return Math.floor(xp/100)+1;}
