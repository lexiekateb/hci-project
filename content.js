function monitorMessages() {
  // have to use sidebar to get chat name since top is clickable- the text is just "Click here for contact info"
  // this is a workaround to get the chat name from the sidebar, with a fallback methodology
  function getChatName() {
    // preferred: selected chat in sidebar
    const sidebarName = document.querySelector(
      '[aria-selected="true"] span[title]'
    );
    const name = sidebarName?.getAttribute("title")?.trim();

    if (name && name.toLowerCase() !== "click here for contact info") {
      return name;
    }

    // fallback: try the top header
    const headerTitle = document.querySelector("header span[title]");
    const fallbackName = headerTitle?.getAttribute("title")?.trim();

    if (
      fallbackName &&
      fallbackName.toLowerCase() !== "click here for contact info"
    ) {
      return fallbackName;
    }

    return "unknown";
  }

  const observer = new MutationObserver(() => {
    const allowedChatNames = ["Rohit Chaudhari"];
    const chatName = getChatName();
    if (!chatName ||  !allowedChatNames.includes(chatName)) return; // Restricts the chats we want to download. 

    const messageContainers = document.querySelectorAll(
      "div.message-in, div.message-out"
    );

    messageContainers.forEach((container) => {
      // Getting the unique message ID
      const data_id = container.parentNode.getAttribute("data-id");
      if (data_id === null) return;
      const message_id = data_id.split("_")[2];

      const messageSpan = container.querySelector("span.selectable-text span");
      if (!messageSpan) return; // no message found

      const text = messageSpan.textContent.trim(); // the text content of the messages

      const sender = container.classList.contains("message-out")
        ? "me"
        : chatName;

      // This sends the messages to backend for storage
      fetch("http://127.0.0.1:8000/messages/",{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
              sender,
              text,
              data_id,
              id: message_id,
              chat_name: chatName,
            })
      }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
    });
  });

  const chatObserverTarget = document.querySelector("#app");
  if (chatObserverTarget) {
    fetch("http://127.0.0.1:8000/ping/")
      .then((response) => {
        // Check if response is OK (status 200-299)
        if (!response.ok) {
          throw new Error("Backend response was not ok");
        }
        return response.json(); // or response.text(), response.blob(), etc.
      })
      .then((data) => {
        console.log(data); // Handle the data from the response
        if (data.message === "pong") {
          observer.observe(chatObserverTarget, {
            childList: true,
            subtree: true,
          });
          console.log("chat monitor is active");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        console.log("chat monitor is inactive");
      });
  } else {
    console.warn("app container not found; retry in 3 sec");
    setTimeout(monitorMessages, 3000);
  }
}

window.addEventListener("load", () => {
  setTimeout(monitorMessages, 5000); // add timeout to let whatsapp page load
});
