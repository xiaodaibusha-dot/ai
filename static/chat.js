// chat.js
document.addEventListener("DOMContentLoaded", function () {
    const messageBox = document.getElementById("message-box");
    const sendButton = document.getElementById("send-button");
    const chatArea = document.getElementById("chat-area");
    const loadingIndicator = document.getElementById("loading-indicator"); // 加载指示器

    // 显示或隐藏加载指示器
    function toggleLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.style.display = "block"; // 显示加载指示器
        } else {
            loadingIndicator.style.display = "none"; // 隐藏加载指示器
        }
    }

    sendButton.addEventListener("click", async function () {
        const userMessage = messageBox.value;
        if (userMessage.trim() === "") return;

        const sessionId = localStorage.getItem("session_id") || Date.now(); // 保存 session_id
        localStorage.setItem("session_id", sessionId);

        // 显示用户消息
        chatArea.innerHTML += `<div class="user-message">${userMessage}</div>`;
        messageBox.value = "";

        // 显示加载状态
        toggleLoading(true);

        try {
            const response = await fetch("http://your-server-ip/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    session_id: sessionId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const reply = data.reply;

                // 显示 AI 回复
                chatArea.innerHTML += `<div class="ai-message">${reply}</div>`;
                chatArea.scrollTop = chatArea.scrollHeight; // 滚动到底部
            } else {
                throw new Error("API 请求失败");
            }
        } catch (error) {
            console.error("请求失败", error);
            chatArea.innerHTML += `<div class="error-message">系统错误，请稍后再试</div>`;
        } finally {
            // 隐藏加载状态
            toggleLoading(false);
        }
    });
});
