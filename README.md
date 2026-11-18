# 河图改编工程

> 从固定原著到剧本、漫画或有声剧，维护删、并、拆、增的理由与来源映射。

## 使用

安装到河图后，在当前Codex等Agent会话发现插件并读取同包Skill，说明目标即可。所有正常业务经河图CLI/MCP完成，桌面用于阅读、比较、反馈和可选编辑。

## 开发

Node25，使用npm ci、npm run build、npm run check和npm run test:unit。专业数据和动作以[功能清单](CAPABILITIES.md)及manifest为准；完整设计、用户用例与发布验收见[docs](docs/README.md)。

## 边界

原著和改编作品各自拥有正文与设定。插件在当前作品维护专业映射；外部目标仅是固定引用，Agent必须沿目标自己的management_ref核验并创建任务。不得把当前连接当成另一端已获权，不把改编例外写回原著。未知目标修订显示待核验。

正文采纳和定稿由宿主及作者决定。
