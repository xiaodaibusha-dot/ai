async function sendMessage() {
    const message = document.getElementById('question').value;
    const sessionId = uuid.v4();  // 每次发送请求时生成新的 sessionId

    const data = {
        message: message,
        session_id: sessionId
    };

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.error) {
            document.getElementById('answer').innerText = result.error;
        } else {
            const reply = result.reply;
            const history = result.history;

            // 更新聊天框，显示所有历史对话
            let historyContent = '';
            history.forEach(item => {
                const role = item.role === 'user' ? 'user' : 'assistant';
                historyContent += `<div class="message ${role}"><strong>${role === 'user' ? '用户' : 'AI'}:</strong> ${item.content}</div>`;
            });

            // 更新对话框的内容
            const conversationHistory = document.getElementById('conversation-history');
            conversationHistory.innerHTML = historyContent;

            // 滚动到最新消息
            conversationHistory.scrollTop = conversationHistory.scrollHeight;

            // 清空输入框
            document.getElementById('question').value = '';
        }
    } catch (error) {
        document.getElementById('answer').innerText = "请求失败，请稍后再试。";
    }
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
