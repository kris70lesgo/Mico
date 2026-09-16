'use client';

import Hls from 'hls.js';
import {useEffect,useRef} from 'react';

export default function HlsVideo({src,className}:{src:string;className?:string}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const video=ref.current;if(!video)return;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;return}if(!Hls.isSupported())return;const hls=new Hls({startLevel:-1,maxBufferLength:60,maxMaxBufferLength:120,abrEwmaDefaultEstimate:50000000});hls.loadSource(src);hls.attachMedia(video);return()=>hls.destroy()},[src]);
 return <video ref={ref} className={className} autoPlay muted loop playsInline/>;
}
