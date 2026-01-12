from fastapi import FastAPI
from pydantic import BaseModel
import openai
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

with open("hiking_knowledge.txt", "r", encoding="utf-8") as f:
    HIKING_KNOWLEDGE = f.read()

# 请使用你的 Deepseek API 密钥
client = openai.Client(api_key="your_api_key", base_url="https://api.deepseek.com/v1")

app = FastAPI()

# 存储会话的字典
SESSIONS = {}

# 静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")

# 系统提示
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

class ChatReq(BaseModel):
    message: str
    session_id: str

@app.get("/")
def index():
    return FileResponse("static/index.html")

@app.post("/chat")
def chat(req: ChatReq):
    session_id = req.session_id

    # 如果会话不存在，初始化
    if session_id not in SESSIONS:
        SESSIONS[session_id] = []

    history = SESSIONS[session_id]

    # 组装消息
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"徒步参考知识：\n{HIKING_KNOWLEDGE}"},
    ]
    
    messages.extend(history)  # 添加历史对话
    messages.append({"role": "user", "content": req.message})  # 添加当前用户输入

    # 通过模型获取回应
    try:
        resp = client.chat.completions.create(
            model="deepseek-chat", 
            messages=messages
        )

        reply = resp.choices[0].message.content

        # 更新历史对话
        history.append({"role": "user", "content": req.message})
        history.append({"role": "assistant", "content": reply})

        return {"reply": reply}
    
    except Exception as e:
        return {"error": f"API 请求失败: {str(e)}"}
