import {useEffect,useMemo,useState} from 'react';
import {GripVertical,Type,Undo2} from 'lucide-react';
import StudyViewer from './study-viewer';
import {STUDY_ORGANS} from './study-data';
import type {Activity,ActivityAnswer} from './mico-lesson-types';

type Props={activity:Activity;disabled:boolean;onAnswerChange:(answer:ActivityAnswer|undefined)=>void};
const letters=['A','B','C','D'];

export default function MicoActivityPlayer({activity,disabled,onAnswerChange}:Props){
 const [choice,setChoice]=useState<number|undefined>();const [typed,setTyped]=useState('');const [ordered,setOrdered]=useState<string[]>([]);
 useEffect(()=>{setChoice(undefined);setTyped('');setOrdered([]);onAnswerChange(undefined);},[activity.id]);
 const organ='organ' in activity?STUDY_ORGANS.find(item=>item.id===activity.organ):undefined;
 const choose=(index:number)=>{if(disabled)return;setChoice(index);onAnswerChange({value:index});};
 const updateText=(value:string)=>{if(disabled)return;setTyped(value);onAnswerChange(value.trim()?{value}:undefined);};
 const remaining=useMemo(()=>activity.kind==='sequence-flow'?activity.steps.filter(item=>!ordered.includes(item.id)):[],[activity,ordered]);
 const addStep=(id:string)=>{if(disabled)return;const next=[...ordered,id];setOrdered(next);onAnswerChange({value:next});};
 const removeStep=(id:string)=>{if(disabled)return;const next=ordered.filter(item=>item!==id);setOrdered(next);onAnswerChange(next.length?{value:next}:undefined);};
 const optionList=activity.kind==='mcq'||activity.kind==='function-from-model'||activity.kind==='case-application'?activity.options:undefined;
 return <div className={`mico-activity mico-activity-${activity.kind}`}>
  {organ&&<div className="mico-model-card" aria-label={`Interactive 3D ${organ.name} model`}>
   <StudyViewer key={activity.id} organ={organ} stage showCaption={false} mode="study" showHotspots={false}/>
   {activity.kind==='type-label'&&<div className="mico-target-status"><Type size={16}/>{activity.hint}</div>}
  </div>}
  {activity.kind==='type-label'&&<label className="mico-answer-input"><span>Your answer</span><input value={typed} onChange={event=>updateText(event.target.value)} disabled={disabled} autoComplete="off" autoCapitalize="words" placeholder="Type the structure name"/></label>}
  {activity.kind==='sequence-flow'&&<div className="mico-sequence">
   <p>Tap each structure in the order blood travels. Tap a selected step to remove it.</p>
   <div className="mico-sequence-answer">{ordered.length===0?<span>Build the pathway here</span>:ordered.map((id,index)=>{const step=activity.steps.find(item=>item.id===id)!;return <button key={id} onClick={()=>removeStep(id)} disabled={disabled}><b>{index+1}</b>{step.label}</button>})}</div>
   <div className="mico-sequence-bank">{remaining.map(step=><button key={step.id} onClick={()=>addStep(step.id)} disabled={disabled}><GripVertical size={15}/>{step.label}</button>)}</div>
   {ordered.length>0&&!disabled&&<button className="mico-sequence-reset" onClick={()=>{setOrdered([]);onAnswerChange(undefined)}}><Undo2 size={14}/> Reset order</button>}
  </div>}
  {optionList&&<div className="mico-options">{optionList.map((option,index)=><button key={option} disabled={disabled} className={choice===index?'chosen':''} onClick={()=>choose(index)}><b>{letters[index]}</b>{option}</button>)}</div>}
 </div>;
}
