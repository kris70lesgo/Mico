'use client';

import {useRouter} from 'next/navigation';
import MicoAuth from './mico-auth';

export default function AuthRoute({mode}:{mode:'login'|'signup'}){
 const router=useRouter();
 return <MicoAuth initialMode={mode} onDemo={()=>router.push('/')} onNavigate={path=>router.push(path==='/'?'/':path==='/signup'?'/register':'/login')}/>;
}
