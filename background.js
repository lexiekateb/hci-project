chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHOW_NOTIFICATION") {
        chrome.notifications.create({
            type: "basic",
            title: "word found",
            message: "the target word was detected in the conversation",
        });
    }
});
