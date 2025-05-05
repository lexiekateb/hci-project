console.log("✅ content.js loaded");

async function observeMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) {
        console.log("chat-messages not found");
        return;
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const presetMessage = node.getAttribute('data-preset_message');
                        if (presetMessage === 'false') {
                            scrapeMessages().catch(console.error);
                        }
                    }
                });
            }
        }
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
}

async function scrapeMessages() {
    const chatContainer = document.getElementById('chat-messages');
    const messages = [];
    chatContainer.childNodes.forEach((elem) => {
        const sender = elem.querySelector(".message-sender").innerText;
        const text = elem.querySelector(".message-text").innerText;
        messages.push({ sender, text });
    })

    const dialog = document.querySelector("dialog");


    fetch("http://127.0.0.1:8000/api/messages/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "conversation": messages })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            if(responseData["conversation_flagged"]){
                dialog.showModal();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Wait for page load
window.addEventListener('load', observeMessages);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "triggerFunction") {
        scrapeMessages();
        sendResponse({ success: true });
    }
});