export type MicoSound='select'|'correct'|'incorrect'|'complete';

/** Small original UI tones. They are intentionally short and optional. */
export function playMicoSound(kind:MicoSound,enabled=true){
 if(!enabled||typeof window==='undefined')return;
 const Audio=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Audio)return;
 const context=new Audio();const now=context.currentTime;const notes:Record<MicoSound,number[]>={select:[440],correct:[523.25,659.25,783.99],incorrect:[220,164.81],complete:[523.25,659.25,783.99,1046.5]};
 notes[kind].forEach((frequency,index)=>{const oscillator=context.createOscillator(),gain=context.createGain();const start=now+index*(kind==='select'?0:.075);oscillator.type=kind==='incorrect'?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(kind==='select'?.025:.055,start);gain.gain.exponentialRampToValueAtTime(.001,start+.14);oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+.16);});
 window.setTimeout(()=>context.close().catch(()=>undefined),650);
}
