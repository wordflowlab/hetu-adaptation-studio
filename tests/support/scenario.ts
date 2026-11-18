import {createHash} from "node:crypto";
import {newProject} from "../../src/domain/model.ts";
export const original="林溪在雨港邮局等信。\n她把旧钥匙放进信封。\n\n第二天，她决定出发。\n";
export const sha=(v:string|Uint8Array)=>createHash("sha256").update(v).digest("hex");
export const sourceRef={kind:"document",work_ref:{workspace_id:"workspace_test",kind:"novel",object_id:"novel_test"},document_id:"doc_11111111-1111-4111-8111-111111111111",revision_id:"rev_11111111-1111-4111-8111-111111111111",sha256:sha(original)};
export const range={source_index:0,byte_start:0,byte_end:Buffer.byteLength(original),quote:original};
export const base=(r:any,key:string)=>({object_id:r.object.object_id,expected_revision:r.object.revision,expected_sha256:r.sha256,operation_key:key});
export const selection=(r:any)=>({object_id:r.object.object_id,revision:r.object.revision});
export function wav(value=6000,frames=800,rate=8000){const b=Buffer.alloc(44+frames*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(frames*2,40);for(let n=0;n<frames;n++)b.writeInt16LE(value,44+n*2);return b;}

export function scenario(_work:any=sourceRef.work_ref):any {return {...newProject("雨港来信"),...{
  "units": [
    {
      "id": "letter",
      "title": "邮局来信",
      "ranges": [range],
      "status": "read"
    },
    {
      "id": "quay",
      "title": "渡口的约定",
      "ranges": [range],
      "status": "partial"
    }
  ],
  "targets": [
    {
      "id": "episode",
      "title": "第一集 无名来信",
      "medium": "drama",
      "order": 0,
      "duration_ms": 120000,
      "work_ref": null,
      "work_revision": null,
      "work_sha256": null
    }
  ],
  "mappings": [
    {
      "id": "opening",
      "source_unit_ids": [
        "letter",
        "quay"
      ],
      "target_id": "episode",
      "treatment": "merge",
      "rationale": "将两次等待合成开篇冲突，保留钥匙和无名来信。",
      "status": "selected"
    }
  ],
  "exceptions": [
    {
      "id": "weather",
      "title": "场景压缩",
      "mapping_id": "opening",
      "description": "把次日渡口提前至同日；这是改编例外，不修改小说历法。"
    }
  ]
}};}
