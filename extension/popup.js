document.getElementById("trigger-btn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "triggerFunction" },
            function (response) {
                console.log("Popup got response:", response);
            }
        );
    });
});