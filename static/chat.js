import { v4 as uuidv4 } from 'uuid';

document.addEventListener("DOMContentLoaded", function() {
    // 检查浏览器是否支持 crypto.randomUUID()，如果不支持，则使用 uuid 库生成 UUID
    if (!crypto.randomUUID) {
        crypto.randomUUID = function () {
            // Polyfill UUID生成方法（简化版示例）
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
    }

    // 发送请求的函数
    const send = async () => {
        const question = document.getElementById("question").value;  // 获取用户输入
        const session_id = uuidv4();  // 使用 uuid 库生成 session_id

        try {
            const res = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: question, session_id: session_id })
            });

            if (res.ok) {
                const data = await res.json();
                document.getElementById("answer").textContent = data.reply;  // 显示 AI 返回的回答
            } else {
                console.error("Request failed with status", res.status);
                alert("请求失败，请稍后重试！");
            }
        } catch (error) {
            console.error("Error during fetch:", error);
            alert("发生错误，请检查网络或稍后再试。");
        }
    }

    // 给发送按钮绑定点击事件
    document.getElementById("send-btn").addEventListener("click", send);
});
