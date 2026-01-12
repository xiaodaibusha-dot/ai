from fastapi import FastAPI
from pydantic import BaseModel
import requests
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# 读取徒步知识文件
with open("hiking_knowledge.txt", "r", encoding="utf-8") as f:
    HIKING_KNOWLEDGE = f.read()

app = FastAPI()

# 存储会话
SESSIONS = {}

# 静态文件配置
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)

# 系统提示（可以根据需要修改）
SYSTEM_PROMPT = """
你是一名有10年以上经验的徒步旅行向导，主要服务对象是普通徒步爱好者和初级徒步者。

你的核心原则：
1. 安全永远第一，避免任何高风险或探险性路线
2. 路线推荐必须考虑季节、天气、海拔和体力匹配度
3. 对不确定信息必须明确说明“需以当地实际情况为准”
4. 不鼓励独行、夜行或无经验者挑战高难度路线

回答必须使用中文，并且严格按照以下结构输出：

【路线推荐】
简要说明适合的徒步区域和路线特点

【行程安排】
Day 1：
Day 2：
Day 3：

【风险提示】
列出可能存在的风险点

【装备建议】
以清单形式给出必要装备
"""

# 定义请求数据模型
class ChatReq(BaseModel):
    message: str
    session_id: str

@app.get("/")
def index():
    return FileResponse("static/index.html")

@app.post("/chat")
def chat(req: ChatReq):
    session_id = req.session_id

    # 如果是新会话，初始化
    if session_id not in SESSIONS:
        SESSIONS[session_id] = []

    history = SESSIONS[session_id]

    # 组装消息（system + 历史对话 + 当前用户输入）
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"徒步参考知识：\n{HIKING_KNOWLEDGE}"},
    ]

    messages.extend(history)  # 加入历史对话
    messages.append({"role": "user", "content": req.message})

    # 调用 DeepSeek API 获取回复
    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",  # DeepSeek API URL
        json={
            "model": "deepseek-chat",  # 可根据需求修改模型名称
            "messages": messages,
        },
        headers={
            "Authorization": "Bearer sk-5c82d1f3a3a34391b1867d62b47084b7"  # 在此替换为你的实际 API 密钥
        }
    )

    if response.status_code == 200:
        reply = response.json()["choices"][0]["message"]["content"]
    else:
        reply = f"抱歉，发生了错误：{response.status_code} {response.text}"

    # 保存历史对话
    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": reply})

    return {"reply": reply}
