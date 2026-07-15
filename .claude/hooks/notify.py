#!/usr/bin/env python3
"""手动触发的 QQ 邮件通知脚本（项目本地）。

用法:
    python .claude/hooks/notify.py              # 无自定义消息
    python .claude/hooks/notify.py "BP 跑完了"  # 带自定义消息

读项目根 .env 的 MAIL_USER / MAIL_PASS / MAIL_TO 发邮件。
- 缺凭证 → stderr 提示 + exit 1
- 发送失败 → stderr 报原因 + exit 1
- 成功 → stdout 报告已发送
"""
import smtplib
import sys
from datetime import datetime
from email.mime.text import MIMEText
from email.utils import formatdate
from pathlib import Path

# Windows 控制台默认 GBK，强制 UTF-8 输出避免中文乱码
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass  # 旧版 Python 无 reconfigure

SCRIPT_DIR = Path(__file__).resolve().parent       # .claude/hooks/
PROJECT_ROOT = SCRIPT_DIR.parent.parent            # 项目根
ENV_PATH = PROJECT_ROOT / ".env"

SMTP_HOST = "smtp.qq.com"
SMTP_PORT = 465


def load_env(path):
    """手动解析 .env（key=value），不依赖 python-dotenv。"""
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def main():
    message = sys.argv[1] if len(sys.argv) > 1 else ""

    env = load_env(ENV_PATH)
    user = env.get("MAIL_USER", "").strip()
    password = env.get("MAIL_PASS", "").strip()
    to = env.get("MAIL_TO", "").strip() or user

    if not user or not password:
        print(
            f"[notify] 未配置凭证：请在 {ENV_PATH} 填 MAIL_USER 与 MAIL_PASS"
            "（QQ 邮箱 SMTP 授权码，非登录密码）",
            file=sys.stderr,
        )
        sys.exit(1)

    project_name = PROJECT_ROOT.name
    now = datetime.now()
    subject = f"[Claude] 通知 · {project_name} · {now.strftime('%H:%M:%S')}"

    body = f"项目: {project_name}\n时间: {now.strftime('%Y-%m-%d %H:%M:%S')}"
    if message:
        body += f"\n\n消息:\n{message}"

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to
    msg["Date"] = formatdate(localtime=True)

    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as s:
            s.login(user, password)
            s.sendmail(user, [to], msg.as_string())
    except Exception as e:
        print(f"[notify] 发送失败: {e}", file=sys.stderr)
        print(
            "[notify] 排查: 授权码是否正确、QQ 邮箱是否开启 IMAP/SMTP、"
            "网络是否可达 smtp.qq.com:465",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"[notify] 已发送到 {to}: {subject}")


if __name__ == "__main__":
    main()
