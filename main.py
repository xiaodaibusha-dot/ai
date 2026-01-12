from fastapi import FastAPI
from pydantic import BaseModel
import openai
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# 使用 DeepSeek API 的客户端配置
client = openai.Client(api_key="your_api_key", base_url="https://api.deepseek.com/v1")

app = FastAPI()

# 存储会话的历史记录
SESSIONS = {}

# 静态文件路径设置
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)

# 默认系统提示
SYSTEM_PROMPT = """
你是一名有10年以上经验的徒步旅行向导，主要服务对象是普通徒步爱好者和初级徒步者。
"""

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

    # 构造 messages（系统提示 + 历史对话 + 当前用户输入）
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": req.message})

    # 请求 DeepSeek API 生成回复
    resp = client.chat.completions.create(
        model="deepseek-chat",  # 使用 DeepSeek 模型
        messages=messages
    )

    reply = resp.choices[0].message.content

    # 更新会话历史
    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": reply})

    return {"reply": reply}
