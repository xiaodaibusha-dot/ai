// =======================
// 1️⃣ 会话 ID（前端唯一标识）
// =======================
let sessionId = localStorage.getItem("session_id")
if (!sessionId) {
  sessionId = crypto.randomUUID()
  localStorage.setItem("session_id", sessionId)
}

// =======================
// 2️⃣ 聊天记录数组（你问的核心）
// =======================
let chatHistory = []

// 页面刷新不丢记录
const savedHistory = localStorage.getItem("chat_history")
if (savedHistory) {
  chatHistory = JSON.parse(savedHistory)
}

// =======================
// 3️⃣ DOM 元素
// =======================
const chatBox = document.getElementById("chat-box")
const input = document.getElementById("question")
const sendBtn = document.getElementById("send-btn")

// =======================
// 4️⃣ 渲染聊天记录
// =======================
function renderChat() {
  chatBox.innerHTML = ""

  chatHistory.forEach(item => {
    const div = document.createElement("div")
    div.className = item.role
    div.innerText = item.content
    chatBox.appendChild(div)
  })

  chatBox.scrollTop = chatBox.scrollHeight
}

// 初始渲染
renderChat()

// =======================
// 5️⃣ 发送消息
// =======================
sendBtn.onclick = async () => {
  const question = input.value.trim()
  if (!question) return

  // 5.1 用户消息入数组
  chatHistory.push({
    role: "user",
    content: question
  })
  renderChat()
  input.value = ""

  // 5.2 请求后端
  const res = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: question,
      session_id: sessionId
    })
  })

  const data = await res.json()

  // 5.3 AI 回复入数组
  chatHistory.push({
    role: "assistant",
    content: data.reply
  })

  // 5.4 本地持久化
  localStorage.setItem("chat_history", JSON.stringify(chatHistory))

  renderChat()
}