function monitorMessages() {
    const keyword = "testing"; // used for testing that the extension is scraping, change based on what word you want to detect
    const savedChats = JSON.parse(localStorage.getItem("whatsapp_chats") || "{}");
  
    // have to use sidebar to get chat name since top is clickable- the text is just "Click here for contact info"
    // this is a workaround to get the chat name from the sidebar, with a fallback methodology
    function getChatName() {
      // preferred: selected chat in sidebar
      const sidebarName = document.querySelector('[aria-selected="true"] span[title]');
      const name = sidebarName?.getAttribute("title")?.trim();
  
      if (name && name.toLowerCase() !== "click here for contact info") {
        return name;
      }
  
      // fallback: try the top header
      const headerTitle = document.querySelector("header span[title]");
      const fallbackName = headerTitle?.getAttribute("title")?.trim();
  
      if (fallbackName && fallbackName.toLowerCase() !== "click here for contact info") {
        return fallbackName;
      }
  
      return "unknown";
    }
  
    const observer = new MutationObserver(() => {
      const chatName = getChatName();
      if (!chatName) return;
  
      if (!savedChats[chatName]) {
        savedChats[chatName] = [];
      }
  
      const chatMessages = savedChats[chatName];
      const existingMessages = new Set(chatMessages.map(m => m.text));
  
      const messageContainers = document.querySelectorAll("div.message-in, div.message-out");
  
      messageContainers.forEach((container) => {
        const messageSpan = container.querySelector("span.selectable-text span");
        if (!messageSpan) return; // no message found
  
        const text = messageSpan.textContent.trim();    // the text content of the messages
        const sender = container.classList.contains("message-out") ? "me" : "other";    // if incoming message, "other". If outgoing, "me"
  
        // check if the message is already saved
        // if the message is already saved, skip it
        // if the message is not already saved, save it
        if (!existingMessages.has(text)) {
          chatMessages.push({ sender, text });
          existingMessages.add(text);
  
        // below can be used for testing to be sure keyword is being found in messages

        //   if (text.toLowerCase().includes(keyword)) {
        //     alert(`Sensitive word detected in chat with ${chatName}: "${text}"`);
        //     console.log(`[${chatName}] Found keyword: ${text}`);
        //   }
  
          localStorage.setItem("whatsapp_chats", JSON.stringify(savedChats));
        }
      });
    });
  
    const chatObserverTarget = document.querySelector("#app");
    if (chatObserverTarget) {
      observer.observe(chatObserverTarget, { childList: true, subtree: true });
      console.log("chat monitor is active");
    } else {
      console.warn("app container not found; retry in 3 sec");
      setTimeout(monitorMessages, 3000);
    }
  }
  
  window.addEventListener("load", () => {
    setTimeout(monitorMessages, 5000);  // add timeout to let whatsapp page load
  });
  