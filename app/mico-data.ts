import type {Activity,Lesson,Unit} from './mico-lesson-types';
export type {Activity,Lesson,Unit} from './mico-lesson-types';

const reference=['Moore, Clinically Oriented Anatomy, 9th ed.'];
const base=(id:string,prompt:string,explanation:string,learningObjective:string,concept?:string)=>({id,prompt,explanation,learningObjective,concept,difficulty:'foundation' as const,references:reference});
const mcq=(id:string,prompt:string,options:string[],answer:number,explanation:string,objective:string,concept?:string):Activity=>({...base(id,prompt,explanation,objective,concept),kind:'mcq',options,answer});
const lesson=(id:string,title:string,icon:string,activities:Activity[]):Lesson=>({id,title,icon,subtitle:'8 min · interactive',activities});

const foundationMap:Activity[]=[
 {...base('fnd-3d-heart','Rotate the model and select the chamber with the thickest myocardium.','The left ventricle generates systemic pressure and therefore has the thickest wall.','Locate a structure using its position and function.','Heart'),kind:'identify-hotspot',organ:'heart',target:'left-ventricle',hint:'It is a lower chamber and pumps into the aorta.'},
 mcq('fnd-plane','Which plane divides the body into right and left portions?',['Frontal','Sagittal','Transverse','Oblique'],1,'A sagittal plane divides the body into right and left portions.','Recognize anatomical planes.'),
 mcq('fnd-medial','The heart is ___ to the lungs.',['Lateral','Superior','Medial','Posterior'],2,'The heart lies near the midline, so it is medial to both lungs.','Use relational anatomical language.','Heart'),
 mcq('fnd-superior','Which term means closer to the head?',['Proximal','Inferior','Superior','Distal'],2,'Superior means toward the head; inferior means toward the feet.','Apply directional terminology.'),
];

const heartChambers:Activity[]=[
 {...base('heart-lv-identify','Rotate the heart and select the chamber with the thickest myocardium.','The left ventricle generates the pressure needed for systemic circulation, so its wall is the thickest.','Identify the left ventricle by location and function.','Heart'),kind:'identify-hotspot',organ:'heart',target:'left-ventricle',hint:'It is the lower chamber that sends blood into the aorta.'},
 {...base('heart-lv-type','Type the name of the chamber that pumps oxygenated blood into the aorta.','The left ventricle ejects oxygenated blood through the aortic valve into the aorta.','Recall the systemic pumping chamber.','Heart'),kind:'type-label',organ:'heart',target:'left-ventricle',accepted:['left ventricle','lv'],hint:'It has the thickest wall and lies below the left atrium.'},
 {...base('heart-mitral-function','Inspect the highlighted valve. What does it prevent during ventricular systole?','The mitral valve closes when left-ventricular pressure exceeds left-atrial pressure, preventing regurgitation into the left atrium.','Relate mitral-valve anatomy to one-way blood flow.','Heart'),kind:'function-from-model',organ:'heart',target:'mitral',options:['Backflow into the left atrium','Blood entering the pulmonary trunk','Venous return through the vena cava','Coronary arterial supply'],answer:0},
 {...base('heart-flow-order','Build the venous-to-pulmonary flow pathway in order.','Deoxygenated blood enters the right atrium, passes the tricuspid valve into the right ventricle, then leaves through the pulmonary trunk.','Sequence right-heart blood flow.','Heart'),kind:'sequence-flow',steps:[{id:'ra',label:'Right atrium'},{id:'tv',label:'Tricuspid valve'},{id:'rv',label:'Right ventricle'},{id:'pt',label:'Pulmonary trunk'}],answer:['ra','tv','rv','pt']},
 {...base('heart-case-rv','A pulmonary embolus abruptly raises pulmonary vascular resistance. Which chamber faces the immediate increase in afterload?','The right ventricle ejects into the pulmonary circulation, so an acute rise in pulmonary resistance increases its afterload.','Apply chamber anatomy to a clinical pressure change.','Heart'),kind:'case-application',organ:'heart',target:'right-ventricle',options:['Left atrium','Left ventricle','Right atrium','Right ventricle'],answer:3},
 mcq('heart-veins','Which vessel returns oxygen-rich blood from the lungs to the heart?',['Pulmonary artery','Superior vena cava','Pulmonary veins','Aorta'],2,'Pulmonary veins return oxygenated blood to the left atrium.','Differentiate pulmonary arteries from pulmonary veins.','Heart'),
];

const heartFlow:Activity[]=[
 {...base('heart-aorta-identify','Find and select the great vessel that carries blood from the left ventricle to systemic circulation.','The aorta is the major systemic artery and receives blood from the left ventricle.','Identify the aorta on a 3D heart.','Heart'),kind:'identify-hotspot',organ:'heart',target:'aorta',hint:'Look superiorly from the left ventricle.'},
 {...base('heart-atrium-type','Type the chamber that receives oxygenated blood from the pulmonary veins.','Pulmonary veins empty into the left atrium.','Recall pulmonary venous return.','Heart'),kind:'type-label',organ:'heart',target:'left-atrium',accepted:['left atrium','la'],hint:'It is superior to the left ventricle.'},
 ...heartChambers.slice(2),
];

const brainLab:Activity[]=[
 {...base('brain-cerebellum','Rotate the brain and select the structure most associated with coordination of gait and eye movements.','The cerebellum integrates sensory input to coordinate balance and voluntary movement.','Locate the cerebellum on a 3D brain.','Brain'),kind:'identify-hotspot',organ:'brain',target:'cerebellum',hint:'Find the posterior-inferior structure.'},
 mcq('brain-vision','Which lobe is most associated with vision?',['Temporal','Parietal','Occipital','Frontal'],2,'The occipital lobe contains the primary visual cortex.','Identify functional cortical regions.','Brain'),
 ...foundationMap.slice(1,3),
];
const lungLab:Activity[]=[
 {...base('lung-trachea','Rotate the lungs and select the airway that conducts air toward both lungs.','The trachea divides into the main bronchi and carries air from the larynx toward the lungs.','Locate the trachea in relation to the lungs.','Lungs'),kind:'identify-hotspot',organ:'lungs',target:'trachea',hint:'It is the central airway above the branching bronchi.'},
 mcq('lung-gas','Gas exchange happens primarily in the…',['Bronchi','Alveoli','Larynx','Pharynx'],1,'Alveoli provide the thin diffusion surface for oxygen and carbon dioxide.','Identify the site of gas exchange.','Lungs'),
 ...foundationMap.slice(1,3),
];
const liverLab:Activity[]=[
 {...base('liver-lobe','Rotate the liver and select its largest lobe.','The right lobe is the largest hepatic lobe.','Identify liver surface anatomy.','Liver'),kind:'identify-hotspot',organ:'liver',target:'right-lobe',hint:'It occupies most of the organ’s anatomical right side.'},
 mcq('liver-bile','Which organ produces bile?',['Liver','Pancreas','Stomach','Kidney'],0,'The liver produces bile; the gallbladder stores and concentrates it.','Identify major digestive organ functions.','Liver'),
 ...foundationMap.slice(1,3),
];
const skeletalLab:Activity[]=[mcq('skel-cranium','Which bone protects the brain?',['Scapula','Cranium','Sternum','Femur'],1,'The cranium encloses and protects the brain.','Identify the skull vault.'),...foundationMap.slice(1)];

const named=(prefix:string,titles:string[],icon:string,activities:Activity[])=>titles.map((title,index)=>lesson(`${prefix}-${index+1}`,title,icon,activities));

export const units:Unit[]=[
 {id:'foundations',title:'Foundations',description:'Orientation, body planes, and anatomical language.',color:'#ff8669',lessons:[
  lesson('anatomy-map','Your anatomy map','✦',foundationMap),
  lesson('anatomical-position','Anatomical position','↕',[...foundationMap,mcq('fnd-palms','In standard anatomical position, the palms face…',['Posteriorly','Medially','Anteriorly','Inferiorly'],2,'The palms face anteriorly in standard anatomical position.','Describe anatomical position.')]),
  ...named('foundations',['Directional language','Planes in practice','Inside the body','Regions and quadrants','Surface landmarks','Imaging orientation','Movement vocabulary','Anatomy map lab','Foundations checkpoint'],'◫',foundationMap),
 ]},
 {id:'skeletal',title:'Skeletal System',description:'Build your framework from skull to toes.',color:'#f4b844',lessons:named('skeletal',['Bones, first look','Bone tissue','Axial skeleton','Skull landmarks','Vertebral column','Thoracic cage','Upper limb','Hand and wrist','Pelvis','Lower limb','Joints in motion','Skeletal checkpoint'],'🦴',skeletalLab)},
 {id:'heart',title:'Heart & Circulation',description:'Follow the route of every heartbeat.',color:'#ee6f63',lessons:[lesson('heart-chambers','Heart chambers','♥',heartChambers),lesson('heart-flow','Blood flow','↗',heartFlow),...named('heart',['External anatomy','Heart valves','Great vessels','Coronary circulation','Conduction system','Cardiac cycle','Pressure and flow','Fetal circulation','Clinical heart cases','Heart checkpoint'],'♥',heartFlow)]},
 {id:'brain',title:'Brain & Nerves',description:'Trace signals from thought to movement.',color:'#9076e8',lessons:named('brain',['Brain orientation','Brain regions','Cerebellum and balance','Brainstem','Cranial nerves','Motor pathways','Sensory pathways','Autonomic system','Neuro cases','Brain checkpoint'],'◉',brainLab)},
 {id:'respiratory',title:'Respiratory System',description:'Learn how oxygen reaches every cell.',color:'#55b9c4',lessons:named('resp',['Airway orientation','Lung lobes','Bronchial tree','Pleura','Alveoli','Gas exchange','Ventilation and perfusion','Diaphragm','Respiratory cases','Breathing checkpoint'],'☁',lungLab)},
 {id:'digestive',title:'Digestion & Metabolism',description:'Turn food into fuel.',color:'#71b65d',lessons:named('digest',['Digestive map','Stomach','Liver anatomy','Pancreas','Intestine','Portal circulation','Absorption','Metabolic roles','Digestive cases','Digestive checkpoint'],'⌇',liverLab)},
];

export const allLessons=units.flatMap(unit=>unit.lessons.map(lesson=>({...lesson,unit})));
