window.onload = function() {
    // 生成一个唯一的会话ID
    const sessionId = uuid.v4();  // 使用 uuid 库生成一个唯一的会话ID
    const sendButton = document.getElementById('send-btn');
    const userMessageInput = document.getElementById('question');
    const answerContainer = document.getElementById('answer');

    sendButton.addEventListener('click', function() {
        const userMessage = userMessageInput.value.trim();

        if (!userMessage) {
            alert("请输入有效的消息！");
            return;
        }

        // 显示正在获取的提示
        answerContainer.textContent = "正在获取AI建议...";

        // 清空用户输入框
        userMessageInput.value = '';

        // 向后端发送请求
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                session_id: sessionId
            })
        })
        .then(response => response.json())
        .then(data => {
            // 检查后台返回的数据，并更新页面上的答案
            if (data.reply) {
                answerContainer.textContent = data.reply;  // 显示AI的回复
            } else {
                answerContainer.textContent = "请求失败，请稍后再试。";
            }
        })
        .catch(error => {
            console.error("请求失败", error);
            answerContainer.textContent = "请求失败，请稍后再试。";
        });
    });
};
