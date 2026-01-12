// chat.js 文件

// 如果你需要引入其他模块，可以在这里做
// 例如导入一个库
// import { someFunction } from './someModule.js';

// 获取 textarea 和按钮
const questionInput = document.getElementById("question");
const sendButton = document.getElementById("send-btn");
const answerOutput = document.getElementById("answer");

// 生成一个新的 session_id
let sessionId = uuid.v4();

// 点击发送按钮时
sendButton.addEventListener('click', async () => {
    const message = questionInput.value;
    
    // 如果用户没有输入问题
    if (!message.trim()) {
        alert("请输入问题！");
        return;
    }

    try {
        // 向后端发送请求
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });

        // 获取返回的 JSON 数据
        const data = await response.json();
        
        // 将 AI 的回答显示在页面上
        answerOutput.textContent = data.reply;
        
    } catch (error) {
        console.error('请求失败:', error);
        alert("请求失败，请稍后再试！");
    }
});
