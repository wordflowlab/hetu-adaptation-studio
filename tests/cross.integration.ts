import assert from "node:assert/strict";
import {test} from "node:test";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {start} from "./support/machine.ts";
import {importText} from "./support/import.ts";
import {candidate,managed} from "./support/creative.ts";
import {scenario,original,sha,selection,base} from "./support/scenario.ts";
const root=process.env.HETU_EF_ROOT??path.resolve("..");
const fixed=(r:any,owner:string)=>({owner_plugin_id:"org.wordflowlab."+owner,object_id:r.object.object_id,revision:r.object.revision,sha256:r.sha256});
test("原著、独立改编目标、试读、局部返工、漫画、有声剧与下一章",{timeout:1800000},async t=>{
 const c=await start(),stages:string[]=[],snapshots:any[]=[];
 const handles=new Map<string,any>();
 async function connect(slug:string):Promise<any>{
  if(slug==="adaptation-studio")return c;
  const directory=path.join(root,"hetu-"+slug),pkg=await c.ok("hetu_plugins_inspect_package",{package_directory:path.join(directory,"dist")});
  await c.ok("hetu_plugins_apply",{action:"install",plugin_id:pkg.manifest.id,package_directory:path.join(directory,"dist"),package_sha256:pkg.package_sha256,expected_sha256:(await c.ok("hetu_plugins_inspect")).state_sha256,authorization_note:"本轮隔离作品跨插件完整验收",operation_key:"cross-install-"+slug});
  const binding={management_ref:c.management,work_ref:c.work,plugin_id:pkg.manifest.id,package_sha256:pkg.package_sha256},cap=await c.ok("hetu_plugins_capabilities",binding);
  const invoke=async(action:string,args:any)=>{const r=await c.ok("hetu_plugins_invoke",{...binding,capabilities_sha256:cap.capabilities_sha256,action,arguments:args});assert.equal(r.result.status,"succeeded",JSON.stringify(r));return r.result.data;};
  const mod:any=await import(pathToFileURL(path.join(directory,"tests/support/scenario.ts")).href);
  return {invoke,pkg,binding,directory,scenario:mod.scenario};
 }
 const save=(h:any,p:any,refs:any[],key:string)=>h.invoke("save_project",{content:p,source_refs:refs,expected_revision:0,expected_sha256:"",operation_key:key});
 try{
  const refs=await importText(c,[original]),before=await c.ok("hetu_read_work",{management_ref:c.management,work_ref:c.work});
  let adaptation=await save(c,scenario(c.work),refs,"cross-adaptation");stages.push("读取固定原著与改编映射，部分阅读如实保持");
  const begin=await c.ok("hetu_begin_creation",{brief:"本轮隔离雨港改编目标",locale:"zh-CN",operation_key:"cross-target-begin"});
  const target=await c.ok("hetu_create_drama_from_project",{management_ref:begin.management_ref,project_id:begin.project.project_id,expected:{revision:begin.revision,sha256:begin.sha256},target_path:begin.target_path,profile:{title:"雨港来信 剧本验收",description:"独立目标作品，不改变原著",mode:"adaptation",language_tag:"zh-CN"},operation_key:"cross-target-create"});
  const targetManagement=target.workspace_management_ref,targetWork={workspace_id:targetManagement.scope_ref.id,kind:"drama",object_id:target.created_workspace_ref.drama_project_id};
  const denied=await c.call("hetu_read_work",{management_ref:c.management,work_ref:targetWork});assert.notEqual(denied.status,"succeeded");
  const targetView=await c.ok("hetu_read_work",{management_ref:targetManagement,work_ref:targetWork});
  const targetContext={...c,management:targetManagement,work:targetWork};
  const preview=await c.ok("hetu_preview_creative_task",{management_ref:targetManagement,work_ref:targetWork,scope_ref:targetManagement.scope_ref,task_kind:"drama_draft",brief:"依据当前会话已分别读取的原著准备隔离剧本候选，保持寄信人悬念。",input_refs:[],client_adapter:"codex",language_tag:"zh-CN"});
  const task=await managed(targetContext,"creative_tasks.prepare",{...preview.prepare_input,operation_key:"cross-drama-task"},"cross-drama-task");
  const opened=await c.ok("hetu_open_collaboration_task",{task_locator:task.task_locator});
  const fountain="INT. 旧邮局 - NIGHT\n\n雨敲着玻璃。林溪掂量一封未署名的信。\n\n林溪\n寄信人究竟是谁？\n";
  const submit=async(content:string,key:string)=>c.ok("hetu_submit_creative_result",{task_ref:opened.task_ref,request_sha256:task.request_sha256,candidates:[{kind:"text",title:"雨港改编参考稿",source_format:"fountain",source_ref_indices:[],content}],complete:true,missing_items:[],provenance:{client:"codex",skill_version:"0.1.0"},operation_key:key});
  const first=await submit(fountain,"cross-script-v1");
  const fixedTarget=targetView.summary.fixed_ref;
  adaptation=await c.invoke("put_target",{...base(adaptation,"cross-bind-target"),target:{...adaptation.object.content.targets[0],work_ref:targetWork,work_revision:fixedTarget.revision_ref.revision,work_sha256:fixedTarget.sha256}});
  assert.equal((await c.invoke("prepare_target",{...selection(adaptation),target_id:"episode"})).target_read_status,"requires_separate_management_ref");
  stages.push("两个作品分别获权，拒绝单端读取目标，独立目标形成Fountain候选");
  const reader=await connect("reader-review");handles.set("reader-review",reader);const rp=reader.scenario(c.work);rp.basis_refs=[fixed(adaptation,"adaptation-studio")];let review=await save(reader,rp,refs,"cross-reader");
  const packet=await reader.invoke("packet_digest",{...selection(review),packet_id:"round-one"});
  const envelope={format:"hetu.reader-feedback",version:1,packet_id:"round-one",packet_sha256:packet.packet_sha256,submission:{id:"cross-feedback",packet_id:"round-one",packet_sha256:packet.packet_sha256,reader_id:"reader-lin",covered_indices:[0],notes:[{id:"mystery",range_index:0,kind:"suggestion",comment:"保留无名来信的悬念，先写动作再说疑问。"}]}};
  const b=Buffer.from(JSON.stringify(envelope));review=await reader.invoke("import_feedback",{...base(review,"cross-feedback-import"),file:{filename:"feedback.json",base64:b.toString("base64"),sha256:sha(b)}});
  review=await reader.invoke("put_decision",{...base(review,"cross-feedback-decision"),decision:{id:"local-revise",submission_id:"cross-feedback",note_id:"mystery",decision:"revise",reason:"只修改目标剧本的疑问表达，不改变原著正文。",recheck_range:null}});
  stages.push("固定试读反馈导入，原话与处理决定分别保存");
  const second=await submit(fountain.replace("寄信人究竟是谁？","(把信翻到背面，停了一下)\n没有署名。"),"cross-script-v2");
  assert.notDeepEqual(first.submission.candidates[0].draft_ref,second.submission.candidates[0].draft_ref);stages.push("同一剧本任务局部返工产生第二候选，旧候选保持");
  const comic=await connect("comic-studio");handles.set("comic-studio",comic);const cp=comic.scenario(c.work),comicRefs=[...refs];cp.basis_refs=[fixed(adaptation,"adaptation-studio"),fixed(review,"reader-review")];
  const media:any=await import(pathToFileURL(path.join(comic.directory,"tests/support/assets.ts")).href);const previousCwd=process.cwd();process.chdir(comic.directory);try{await media.prepareMedia(c,cp,comicRefs,"comic-studio");}finally{process.chdir(previousCwd);}
  const comicRecord=await save(comic,cp,comicRefs,"cross-comic");assert.deepEqual((await comic.invoke("check_layout",selection(comicRecord))).missing_art_panel_ids,[]);stages.push("实际固定图像、分格与气泡组成同源漫画工程");
  const audio=await connect("audio-drama");handles.set("audio-drama",audio);const ap=audio.scenario(c.work),audioRefs=[...refs];ap.basis_refs=[fixed(adaptation,"adaptation-studio"),fixed(comicRecord,"comic-studio")];
  const audioMedia:any=await import(pathToFileURL(path.join(audio.directory,"tests/support/assets.ts")).href);process.chdir(audio.directory);try{await audioMedia.prepareMedia(c,ap,audioRefs,"audio-drama");}finally{process.chdir(previousCwd);}
  const audioRecord=await save(audio,ap,audioRefs,"cross-audio");const mixed=await audio.invoke("check_mix",selection(audioRecord));assert.deepEqual(mixed.unrecorded_line_ids,[]);assert.deepEqual(mixed.stale_note_ids,[]);stages.push("两角色实际声音、时间线与确定性混音，听审意见固定原时间线");
  const next=await candidate(c,"第二章 渡口\n\n林溪把旧钥匙收好，沿着雨水走向渡口。\n","cross-next-chapter");assert.ok(next.source_ref.sha256);
  const originalAdaptation=await c.invoke("get_project",selection(adaptation));assert.equal(originalAdaptation.sha256,adaptation.sha256);
  const report=await c.invoke("preview_impact",{...selection(adaptation),changed_source_indices:[0]});assert.deepEqual(report.target_ids,["episode"]);
  const after=await c.ok("hetu_read_work",{management_ref:c.management,work_ref:c.work});assert.equal(after.sha256,before.sha256);
  stages.push("新候选和下一章接续，旧专业依据保持，原著摘要不变");
  for(const [slug,r] of [["adaptation-studio",adaptation],["reader-review",review],["comic-studio",comicRecord],["audio-drama",audioRecord]] as const)snapshots.push({slug,ref:fixed(r,slug),package_sha256:slug==="adaptation-studio"?c.pkg.package_sha256:handles.get(slug).pkg.package_sha256});
  const dir=process.env.HETU_RECEIPT_DIRECTORY??"docs/research";await mkdir(dir,{recursive:true});await writeFile(path.join(dir,"cross-acceptance.json"),JSON.stringify({recorded_at:new Date().toISOString(),host_version:c.coreVersion,platform:process.platform,architecture:process.arch,stages,snapshots,source_sha256:before.sha256,final_source_sha256:after.sha256,independent_target:targetWork,target_candidates:2,adopted:false,finalized:false,limits:["隔离验收样本和导入的试读意见，不是真实读者研究或文学质量评价","不包含付费模型、正文采纳或定稿"]},null,2)+"\n");t.diagnostic(c.directory);
 }finally{await c.client.close();}
});
