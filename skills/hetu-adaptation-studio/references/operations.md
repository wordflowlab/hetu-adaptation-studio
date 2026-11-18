# 操作地图

由正式清单生成，执行前发现当前安装版Schema。

| 动作 | 用途 | 必填参数 | 效果 |
| --- | --- | --- | --- |
| list_projects | 查找专业工程 |  | read |
| get_project | 读取固定专业工程 | object_id | read |
| save_project | 保存完整专业工程 | expected_revision, expected_sha256, operation_key, content | managed_write |
| put_unit | 维护原著单元 | object_id, expected_revision, expected_sha256, operation_key, unit | managed_write |
| remove_unit | 移除原著单元 | object_id, expected_revision, expected_sha256, operation_key, unit_id | managed_write |
| put_target | 维护目标段落 | object_id, expected_revision, expected_sha256, operation_key, target | managed_write |
| remove_target | 移除目标段落 | object_id, expected_revision, expected_sha256, operation_key, target_id | managed_write |
| put_mapping | 维护改编映射 | object_id, expected_revision, expected_sha256, operation_key, mapping | managed_write |
| remove_mapping | 移除改编映射 | object_id, expected_revision, expected_sha256, operation_key, mapping_id | managed_write |
| put_exception | 维护改编例外 | object_id, expected_revision, expected_sha256, operation_key, exception | managed_write |
| remove_exception | 移除改编例外 | object_id, expected_revision, expected_sha256, operation_key, exception_id | managed_write |
| check_adaptation | 检查改编覆盖 | object_id | read |
| preview_impact | 预览原著更新影响 | object_id, changed_source_indices | read |
| prepare_target | 准备目标写作交接 | object_id, target_id | read |
| get_source | 读取固定来源 | object_id, source_index | read |
| get_basis | 读取固定专业依据 | object_id, basis_index | read |
| compare_versions | 比较固定修订 | object_id, from_revision, to_revision | read |
| export_project | 导出固定专业报告 | object_id, format | read |
| build_context | 准备有界创作上下文 | object_id, goal, max_chars | read |
| create_handoff | 准备精确AI交接 | object_id, goal | read |
| get_operation | 回读原操作 | operation_key | read |
