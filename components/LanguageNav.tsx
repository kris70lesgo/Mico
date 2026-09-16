'use client';

import {ChevronLeft,ChevronRight} from 'lucide-react';
import {useRef} from 'react';

const systems=['Heart','Brain','Lungs','Liver','Kidneys','Eyes','Skin','Pancreas','Intestines'];
export default function LanguageNav(){const ref=useRef<HTMLDivElement>(null);const shift=(amount:number)=>ref.current?.scrollBy({left:amount,behavior:'smooth'});return <div className="flex h-[74px] w-full items-center border-y-2 border-[#e5e5e5]"><div className="mx-auto grid h-full w-full max-w-[1056px] grid-cols-[14px_1fr_14px] items-center gap-[30px] px-4"><button aria-label="Previous systems" onClick={()=>shift(-300)}><ChevronLeft className="text-[#afafaf]"/></button><div ref={ref} className="flex gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">{systems.map(name=><button className="flex items-center gap-2 rounded-lg px-1 py-1 text-[16px] font-bold uppercase text-[#777] hover:bg-black/5" key={name}><span className="grid h-8 w-8 place-items-center rounded-full bg-[#dff4ff] text-[11px] text-[#1cb0f6]">{name[0]}</span>{name}</button>)}</div><button aria-label="Next systems" onClick={()=>shift(300)}><ChevronRight className="text-[#afafaf]"/></button></div></div>}
