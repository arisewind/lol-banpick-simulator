---
description: 发一封 QQ 邮件通知到 .env 配置的邮箱（项目本地，手动触发）
---

运行项目本地的邮件通知脚本，发一封邮件到 `.env` 配置的 QQ 邮箱。

执行：

```
python .claude/hooks/notify.py "$ARGUMENTS"
```

- `$ARGUMENTS` 是用户可选附带的**自定义消息**，原样作为脚本第一个参数传入（如 `/notify BP 测试跑完了` → 消息为 "BP 测试跑完了"）
- 脚本读项目根 `.env` 的 `MAIL_USER` / `MAIL_PASS` / `MAIL_TO` 发件
- **失败时**（stderr 非空或 exit≠0）：把原因转告用户，并给修复建议——
  - "未配置凭证" → 提示去 `.env` 填 QQ 邮箱 + SMTP 授权码（参照 `.env.example`）
  - "发送失败" → 提示检查授权码是否对、QQ 邮箱是否开启 IMAP/SMTP、网络
- **成功时**：告诉用户邮件已发到 `MAIL_TO`，附标题
