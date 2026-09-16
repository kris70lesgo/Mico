import type {Metadata} from 'next';
import './globals.css';

export const metadata:Metadata={title:'Mico · Interactive Anatomy',description:'Interactive anatomy learning with Mico'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
