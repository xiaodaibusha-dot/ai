let sessionId = uuid.v4(); // 使用UUID生成唯一会话ID

// 发送消息到后端
function sendMessage() {
    const userMessage = document.getElementById("question").value;
    if (!userMessage.trim()) return; // 空消息不发送

    // 更新聊天框，显示用户消息
    appendMessage('用户', userMessage);

    // 清空输入框
    document.getElementById("question").value = "";

    // 显示加载提示
    appendMessage('AI', '正在生成回答，请稍候...');

    // 向后端发送请求
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: userMessage,
            session_id: sessionId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // 获取AI的回答
        const aiReply = data.reply;

        // 清除加载提示，显示AI回复
        const lastMessage = document.querySelector('#chat-box .message:last-child');
        lastMessage.textContent = aiReply;

        // 更新聊天框，显示AI回复
        appendMessage('AI', aiReply);
    })
    .catch(error => {
        console.error('Error:', error);
        alert("请求失败，请稍后再试！");
    });
}

// 在聊天框中添加消息
function appendMessage(sender, message) {
    const messageBox = document.createElement("div");
    messageBox.classList.add("message");
    messageBox.textContent = `${sender}: ${message}`;
    document.getElementById("chat-box").appendChild(messageBox);
}

// 监听发送按钮的点击事件
document.getElementById("send-btn").addEventListener("click", sendMessage);

// 页面加载时，初始化聊天框
window.onload = function() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = '';  // 清空聊天框
};
