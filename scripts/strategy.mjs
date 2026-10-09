#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
import {page,table as htmlTable,writeOut} from './lib/render.mjs';

// Static identifiers only. User values are always bound parameters.
export const entities=JSON.parse(fs.readFileSync(path.join(REPO_ROOT,'entities.json'),'utf8'));
export const rules={
 'MEASURE-STALE':['House policy','Update cadence chosen for each measure',null],
 'INITIATIVE-DUE':['House policy','Agreed initiative due date',null],
 'INITIATIVE-ALIGNMENT':['House policy','Active spending needs an objective',null],
 'INITIATIVE-BUDGET':['House policy','Compare spend with approved budget in its currency',null],
 'DECISION-DUE':['House policy','Decision due date',null],
 'ACTION-DUE':['House policy','Decision follow-through due date',null],
 'PRIVACY-REVIEW':['NZ Privacy Act 2020, IPP9 / house policy','Review retention purpose; due dates are set by the business','https://www.privacy.org.nz/privacy-principles/9/'],
 'DEPENDENCY-BLOCKED':['House policy','Prerequisite must complete before dependent work',null],
 'OWNER-MISSING':['House policy','Assign an accountable objective owner',null]
};
export const reads={
 attention:'select rule,code,owner,due_on,finding from strategy_findings order by due_on nulls first,code,rule',
 scorecard:'select code,name,owner,unit,actual,target,progress_pct,expected_pct,health from strategy_scorecard order by code',
 'stale-updates':"select code,name,owner,observed_on,cadence_days,health from strategy_scorecard where health in ('stale','missing') order by code",
 'initiative-review':'select * from strategy_portfolio order by due_on,code',
 'dependency-review':'select * from strategy_dependencies order by prerequisite_due,code',
 'decision-review':'select code,title,owner,due_on,status,rationale,evidence from decisions order by due_on,code',
 'action-review':'select a.code,a.title,d.code as decision,a.owner,a.due_on,a.status,a.completed_on,a.evidence from actions a join decisions d on d.id=a.decision_id order by a.due_on,a.code',
 'alignment-review':"select * from strategy_portfolio where objective='UNALIGNED' order by code",
 'owner-load':"select owner,count(*) as active_initiatives,count(*) filter(where due_on<current_date) as overdue from initiatives where status not in ('completed','cancelled') group by owner order by overdue desc,owner",
 'budget-review':"select currency,sum(budget) as budget,sum(spent) as spent,sum(spent-budget) as variance from initiatives where status<>'cancelled' group by currency order by currency",
 'measure-history':'select m.code as measure,x.code,x.observed_on,x.value,x.evidence,x.recorded_by from observations x join measures m on m.id=x.measure_id order by m.code,x.observed_on',
 activity:'select kind,actor,action,details,created_at from activity order by created_at desc,id'
};
function need(o,k){if(o[k]===undefined||o[k]===null||String(o[k]).trim()==='')throw Error(`Give --${k.replaceAll('_','-')}`);return o[k];}
function entity(kind){if(!entities[kind])throw Error(`Choose --kind=${Object.keys(entities).join('|')}`);return entities[kind];}
export async function resolve(db,kind,value){
 entity(kind);const names=entities[kind].fields.filter(f=>['name','title','person'].includes(f));
 const exact=await db.query(`select * from ${kind} where lower(code)=lower($1) or id::text=$1`,[String(value)]);
 if(exact.length===1)return exact[0];
 const rows=await db.query(`select * from ${kind} where left(id::text,length($1))=lower($1) or position(lower($1) in lower(code))>0 ${names.map(n=>`or position(lower($1) in lower(${n}))>0`).join(' ')} order by code`,[String(value)]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${kind}: ${rows.map(r=>`${r.code} (${r.id})`).join(', ')}`:`No ${kind} match: ${value}`);
 return rows[0];
}
async function fields(db,kind,input,partial=false){
 const spec=entity(kind),out={};
 for(const [key,val] of Object.entries(input)){
  if(!spec.fields.includes(key))throw Error(`Unknown ${kind} field ${key}`);
  let v=val;
  if(['personal_data'].includes(key)){if(!['true','false','yes','no','1','0'].includes(String(v).toLowerCase()))throw Error(`Invalid boolean ${key}`);v=['true','yes','1'].includes(String(v).toLowerCase());}
  if(key.endsWith('_on')||key.endsWith('_due')){
   if(v==='')v=null;
   if(v!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(String(v))||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))throw Error(`Invalid ISO date ${key}: ${v}`);
  }
  if(['completed_on','observed_on'].includes(key)&&v&&v>new Date().toISOString().slice(0,10))throw Error(`${key} cannot be in the future`);
  if(['baseline','target','value','budget','spent','cadence_days'].includes(key)){if(String(v).trim()===''||!Number.isFinite(Number(v)))throw Error(`Invalid number ${key}`);v=Number(v);if(key==='cadence_days'&&!Number.isInteger(v))throw Error('Cadence must be an integer');}
  if(spec.refs?.[key])v=v? (await resolve(db,spec.refs[key],v)).id:null;
  if(key==='code'){v=String(v).trim();if(!v)throw Error('Empty code');}
  out[key]=v;
 }
 if(!partial)for(const k of spec.required)need(out,k);
 return out;
}
async function record(db,kind,id,actor,action,details){await db.query('insert into activity(kind,record_id,actor,action,details) values($1,$2,$3,$4,$5::jsonb)',[kind,id,actor,action,JSON.stringify(details)]);}
async function transaction(db,fn,dry=false){await db.exec('begin');try{const out=await fn();await db.exec(dry?'rollback':'commit');return out;}catch(e){await db.exec('rollback');throw e;}}
async function insert(db,kind,data,actor){const cols=Object.keys(data);const [r]=await db.query(`insert into ${kind} (${cols.join(',')}) values(${cols.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data));await record(db,kind,r.id,actor,'add',data);return r;}
async function update(db,kind,ref,changes,actor){const before=await resolve(db,kind,ref);const data=await fields(db,kind,changes,true);const cols=Object.keys(data);if(!cols.length)throw Error('No changed fields');const [r]=await db.query(`update ${kind} set ${cols.map((k,i)=>`${k}=$${i+1}`).join(',')} where id=$${cols.length+1} returning *`,[...Object.values(data),before.id]);await record(db,kind,r.id,actor,'update',{before,changes:data});return r;}
function csv(rows,cols){const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';return [cols.map(esc).join(','),...rows.map(r=>cols.map(k=>esc(r[k])).join(','))].join('\r\n')+'\r\n';}
export const commands=[...Object.keys(reads),'help','list','show','compliance','weekly-review','add','update','log','check-in','close-action','import','export','draft-board-pack','draft-decision'];
export async function run(db,command,opts={},args=[]){
 if(reads[command])return db.query(reads[command]);
 if(command==='help')return commands.map(command=>({command}));
 if(command==='list'){entity(opts.kind);return db.query(`select * from ${opts.kind} order by code`);}
 if(command==='show')return [await resolve(db,opts.kind,need(opts,'ref'))];
 if(command==='compliance')return (await db.query(reads.attention)).map(r=>({...r,basis:rules[r.rule][0],check:rules[r.rule][1],source:rules[r.rule][2]||'docs/compliance.md (house policy)'}));
 if(command==='weekly-review')return {attention:await run(db,'attention'),scorecard:await run(db,'scorecard'),dependencies:await run(db,'dependency-review'),decisions:await run(db,'decision-review')};
 if(command==='add'||command==='update'){
  const actor=need(opts,'actor'),kind=need(opts,'kind');entity(kind);
  const input=Object.fromEntries(Object.entries(opts).filter(([k])=>!['actor','kind','ref','json'].includes(k)));
  return transaction(db,async()=>command==='add'?[await insert(db,kind,await fields(db,kind,input),actor)]:[await update(db,kind,need(opts,'ref'),input,actor)]);
 }
 if(command==='check-in'){
  const actor=need(opts,'actor');const input={};for(const k of ['code','measure_id','observed_on','value','evidence'])input[k]=need(opts,k);input.recorded_by=actor;
  return transaction(db,async()=>[await insert(db,'observations',await fields(db,'observations',input),actor)]);
 }
 if(command==='close-action'){
  const actor=need(opts,'actor');return transaction(db,async()=>[await update(db,'actions',need(opts,'ref'),{status:'completed',completed_on:need(opts,'completed_on'),evidence:need(opts,'evidence')},actor)]);
 }
 if(command==='log'){
  const actor=need(opts,'actor'),kind=need(opts,'kind'),r=await resolve(db,kind,need(opts,'ref'));need(opts,'note');
  await record(db,kind,r.id,actor,'note',{note:opts.note});return [{code:r.code,logged:true}];
 }
 if(command==='import'){
  if(args[0]!=='cascade')throw Error('Use import cascade --kind=... --file=... --map=... --actor=... [--dry-run]');
  const kind=need(opts,'kind'),spec=entity(kind),actor=need(opts,'actor');
  const mapping=JSON.parse(fs.readFileSync(need(opts,'map'),'utf8'));
  if(!mapping||Array.isArray(mapping)||typeof mapping!=='object')throw Error('Map must be an object of local field to source header');
  for(const [k,v] of Object.entries(mapping)){if(!spec.fields.includes(k)||typeof v!=='string'||!v.trim())throw Error(`Invalid mapping ${k}`);}
  for(const k of spec.required)if(!mapping[k])throw Error(`Map requires ${k}`);
  const rows=parseCsv(fs.readFileSync(need(opts,'file'),'utf8'));if(!rows.length)throw Error('CSV contains no records');
  const headers=Object.keys(rows[0]);for(const h of Object.values(mapping))if(!headers.includes(h))throw Error(`Missing CSV header: ${h}`);
  return transaction(db,async()=>{
   let added=0,unchanged=0;const seen=new Set();
   for(const row of rows){
    const raw=Object.fromEntries(Object.entries(mapping).map(([k,h])=>[k,row[h]]));const data=await fields(db,kind,raw);
    if(seen.has(data.code.toLowerCase()))throw Error(`Duplicate code in file: ${data.code}`);seen.add(data.code.toLowerCase());
    const existing=await db.query(`select * from ${kind} where lower(code)=lower($1)`,[data.code]);
    if(existing.length){if(existing.length>1||Object.entries(data).some(([k,v])=>String(existing[0][k]??'')!==String(v??'')))throw Error(`Conflicting existing record ${data.code}; review before updating`);unchanged++;continue;}
    const r=await insert(db,kind,data,actor);await record(db,kind,r.id,actor,'import-source',{vendor:'Cascade',source_file:path.basename(opts.file),row,mapping});added++;
   }
   return [{kind,rows:rows.length,added,unchanged,dry_run:Boolean(opts.dry_run),unmapped_headers:headers.filter(h=>!Object.values(mapping).includes(h)).join(', ')}];
  },Boolean(opts.dry_run));
 }
 if(command==='export'){
  const dir=path.resolve(opts.dir||path.join(REPO_ROOT,'exports'));fs.mkdirSync(dir,{recursive:true});
  if(opts.kind){const spec=entity(opts.kind),rows=await db.query(`select * from ${opts.kind} order by code`);
   for(const r of rows)for(const [k,target] of Object.entries(spec.refs||{}))if(r[k])r[k]=(await resolve(db,target,r[k])).code;
   const file=path.join(dir,opts.kind+'.csv');fs.writeFileSync(file,csv(rows,spec.fields));return [{file,rows:rows.length}];
  }
  const out={exported_at:new Date().toISOString(),version:1};for(const kind of [...Object.keys(entities),'activity'])out[kind]=await db.query(`select * from ${kind} order by id`);
  const file=path.join(dir,'strategy-backup.json');fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');return [{file,records:Object.keys(entities).reduce((n,k)=>n+out[k].length,0)}];
 }
 if(command==='draft-board-pack'||command==='draft-decision'){
  const kind=command==='draft-board-pack'?'plans':'decisions',r=await resolve(db,kind,need(opts,'ref'));
  let sections;
  if(kind==='plans'){
   const objectives=await db.query('select code,title,owner,due_on,status from objectives where plan_id=$1 order by code',[r.id]);
   const measures=await db.query('select s.* from strategy_scorecard s join objectives o on o.code=s.objective where o.plan_id=$1 order by s.code',[r.id]);
   const initiatives=await db.query('select s.* from strategy_portfolio s join objectives o on o.code=s.objective where o.plan_id=$1 order by s.code',[r.id]);
   sections=[{title:'Objectives',html:htmlTable(objectives)},{title:'Measures',html:htmlTable(measures)},{title:'Initiatives',html:htmlTable(initiatives)}];
  }else{
   const actions=await db.query('select code,title,owner,due_on,status,evidence from actions where decision_id=$1 order by code',[r.id]);
   sections=[{title:'Decision',html:htmlTable([r])},{title:'Follow-through',html:htmlTable(actions)}];
  }
  const file=writeOut('drafts',`${command}-${r.code.replace(/[^a-zA-Z0-9-]/g,'_')}-${r.id}`,page({title:kind==='plans'?'Board strategy pack: DRAFT':'Decision record: DRAFT',subtitle:r.code,sections:[{title:'For review',note:'Check the reporting period, evidence and recipients. Nothing has been sent.',html:''},...sections]}));return [{file,status:'draft only'}];
 }
 throw Error(`Unknown command ${command}. Run help.`);
}
export function print(value){
 if(Array.isArray(value))return value.length?table(value,Object.keys(value[0]).map(key=>({key,label:key,width:80}))):'  (none)';
 return Object.entries(value).map(([k,v])=>`${k}\n${print(v)}`).join('\n\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [command='help',...rest]=process.argv.slice(2),opts={},args=[];
 for(const a of rest){if(a.startsWith('--')){const at=a.indexOf('=');const key=a.slice(2,at<0?undefined:at).replaceAll('-','_');opts[key]=at<0?true:a.slice(at+1);}else args.push(a);}
 let db;try{db=await getDb();const out=await run(db,command,opts,args);console.log(opts.json?JSON.stringify(out):print(out));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
