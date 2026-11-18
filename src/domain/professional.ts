import {requireValue as need} from "../../vendor/project-store.ts";
export function validateDomain(p:any){
 const units=new Set(p.units.map((u:any)=>u.id)),targets=new Set(p.targets.map((t:any)=>t.id)),maps=new Set(p.mappings.map((m:any)=>m.id));
 need(new Set(p.targets.map((t:any)=>t.order)).size===p.targets.length,"目标顺序不能重复。");
 for(const u of p.units)need(u.status==="unread"||u.ranges.length,"已读或部分阅读单元须有固定原文依据。");
 for(const t of p.targets){const fields=[t.work_ref,t.work_revision,t.work_sha256];need(fields.every(x=>x===null)||fields.every(x=>x!==null),"外部目标须同时固定作品、修订和摘要。");}
 for(const m of p.mappings){
  need(new Set(m.source_unit_ids).size===m.source_unit_ids.length&&m.source_unit_ids.every((id:string)=>units.has(id)),"改编来源单元不存在或重复。");
  need(m.target_id===null||targets.has(m.target_id),"改编目标不存在。");
  if(m.treatment==="omit")need(m.target_id===null&&m.source_unit_ids.length>0,"省略记录须有来源且无目标。");
  else if(m.treatment==="add")need(m.target_id!==null&&m.source_unit_ids.length===0,"新增记录须有目标且无原著单元。");
  else need(m.target_id!==null&&m.source_unit_ids.length>0,"改编映射须同时明确两端。");
  if(m.treatment==="merge")need(m.source_unit_ids.length>=2,"合并须至少两个来源单元。");
  if(m.treatment!=="preserve")need(m.rationale.trim(),"删并拆增须保留改编理由。");
 }
 for(const e of p.exceptions)need(e.mapping_id===null||maps.has(e.mapping_id),"例外关联不存在。");
}
export function checkAdaptation(p:any){
 const mapped=new Set(p.mappings.filter((m:any)=>m.status==="selected").flatMap((m:any)=>m.source_unit_ids));
 return {read_unit_ids:p.units.filter((u:any)=>u.status==="read").map((u:any)=>u.id),unread_unit_ids:p.units.filter((u:any)=>u.status!=="read").map((u:any)=>u.id),unmapped_unit_ids:p.units.filter((u:any)=>!mapped.has(u.id)).map((u:any)=>u.id),unmapped_target_ids:p.targets.filter((t:any)=>!p.mappings.some((m:any)=>m.target_id===t.id&&m.status==="selected")).map((t:any)=>t.id),complete:p.units.length>0&&p.units.every((u:any)=>u.status==="read"&&mapped.has(u.id)),semantic_review_required:true,note:"映射完整不代表改编质量、目标成文或作者认可。"};
}
export function impact(p:any,changed:number[]){const units=p.units.filter((u:any)=>u.ranges.some((r:any)=>changed.includes(r.source_index))).map((u:any)=>u.id);const maps=p.mappings.filter((m:any)=>m.source_unit_ids.some((id:string)=>units.includes(id)));return {source_unit_ids:units,mapping_ids:maps.map((m:any)=>m.id),target_ids:[...new Set(maps.map((m:any)=>m.target_id).filter(Boolean))],exception_ids:p.exceptions.filter((e:any)=>maps.some((m:any)=>m.id===e.mapping_id)).map((e:any)=>e.id),old_references_preserved:true};}
export async function checkSources(_p:any,_sources:any[],_request?:any){}
export function pureAction(_action:string,_i:any){return undefined;}
export async function writeProfessional(_a:string,_p:any,_s:any[],_i:any,_request?:any){throw Error("未知专业写入。");}
export async function readProfessional(action:string,p:any,_sources:any[],i:any,_request?:any){
 if(action==="check_adaptation")return checkAdaptation(p);
 if(action==="preview_impact")return impact(p,i.changed_source_indices);
 if(action==="prepare_target"){const t=p.targets.find((t:any)=>t.id===i.target_id);need(t,"目标不存在。");return {target:t,units:p.units.filter((u:any)=>p.mappings.some((m:any)=>m.target_id===t.id&&m.source_unit_ids.includes(u.id))),mappings:p.mappings.filter((m:any)=>m.target_id===t.id),exceptions:p.exceptions.filter((e:any)=>p.mappings.some((m:any)=>m.id===e.mapping_id&&m.target_id===t.id)),target_read_status:t.work_ref?"requires_separate_management_ref":"planning_only",note:"本结果未读取或修改目标正文；Agent须沿目标自己的管理引用发现能力、核验固定修订并准备候选。"};}
}
export function summaries(p:any){return [
 {title:"原著覆盖",lines:p.units.map((u:any)=>u.title+" · "+({read:"已读",partial:"部分已读",unread:"未读"} as any)[u.status])},
 {title:"目标结构",lines:[...p.targets].sort((a,b)=>a.order-b.order).map((t:any)=>t.title+" · "+t.medium)},
 {title:"改编映射",lines:p.mappings.map((m:any)=>m.source_unit_ids.map((id:string)=>p.units.find((u:any)=>u.id===id)?.title).join("、")+" → "+(p.targets.find((t:any)=>t.id===m.target_id)?.title??"省略")+"："+m.rationale)},
 {title:"改编例外",lines:p.exceptions.map((e:any)=>e.title+"："+e.description)}];}
