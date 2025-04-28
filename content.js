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
    const allowedChatNames = ["Rohit Chaudhari", "Lexie HCI Group Project"];
    const chatName = getChatName();
    if (!chatName || !allowedChatNames.includes(chatName)) return; // Restricts the chats we want to download.

    const messageContainers = document.querySelectorAll(
      "div.message-in, div.message-out"
    );

    messageContainers.forEach((container) => {
      // Getting the unique message ID
      const data_id = container.parentNode.getAttribute("data-id");
      if (data_id === null) return;
      const message_id = data_id.split("_")[2];

      // Finding the time the message was sent at
      const time_sender_data_div = container.querySelector("div.copyable-text");
      if (!time_sender_data_div) return; // div not detected
      const time_sender_data = time_sender_data_div.getAttribute(
        "data-pre-plain-text"
      );
      const datetime_string = time_sender_data.slice(
        time_sender_data.indexOf("[") + 1,
        time_sender_data.indexOf("]")
      );
      const parsedDate = new Date(datetime_string);
      const isoString = parsedDate.toISOString();

      const messageSpan = container.querySelector("span.selectable-text span");
      if (!messageSpan) return; // no message found

      const text = messageSpan.textContent.trim(); // the text content of the messages

      const sender = container.classList.contains("message-out")
        ? "me"
        : chatName;

      // This sends the messages to backend for storage
      fetch("http://127.0.0.1:8000/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender,
          text,
          data_id,
          id: message_id,
          chat_name: chatName,
          date_time: isoString,
        }),
      })
        .then((response) => response.json())
        // .then((data) => console.log(data))
        .catch((error) => console.error(error));
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
          setInterval(pollServerForPopupTrigger,3000);
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

async function pollServerForPopupTrigger() {
  fetch("http://127.0.0.1:8000/popup_trigger/")
    .then((response) => {
      // Check if response is OK (status 200-299)
      if (!response.ok) {
        throw new Error("Backend response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.trigger_popup) {
        console.log("dangerous content detected; trigger popup");
        showPopup();
      }
      else {
        console.log("no popup trigger");
      }
    });
}

function showPopup() {
  if (document.getElementById("danger-popup")) return;  // if the popup is already on screen, don't show again

  const style = document.createElement("style");
  style.textContent = `

    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .popup-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .popup-box {
      background: white;
      border-radius: 20px;
      padding: 40px 60px;
      max-width: 500px;
      text-align: center;
      position: relative;
      animation: fadeIn 0.3s ease-out forwards;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .popup-box h2 {
      margin-bottom: 15px;
      color: #c0392b;
      font-size: 24px;
    }

    .popup-box p {
      font-size: 18px;
      margin-bottom: 30px;
      color: #333;
    }

    .countdown-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      position: relative;
    }

    .countdown-circle text {
      fill: #c0392b;
      font-size: 18px;
      font-weight: bold;
      text-anchor: middle;
      dominant-baseline: middle;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.id = "danger-popup";

  overlay.innerHTML = `
    <div class="popup-box">
      <h2>⚠️ Dangerous Content Detected</h2>
      <p>Please notify a parent or trusted adult immediately.</p>
      <div class="countdown-circle">
        <svg width="100" height="100">
          <g transform="rotate(-90 50 50)">
            <circle cx="50" cy="50" r="45" stroke="#e0e0e0" stroke-width="8" fill="none"/>
            <circle id="progress-circle" cx="50" cy="50" r="45" stroke="#e74c3c" stroke-width="8" fill="none"
              stroke-dasharray="282.743" stroke-dashoffset="0"/>
          </g>
          <text x="50" y="50" id="countdown-text">10</text>
        </svg>
      </div>


    </div>
  `;

  document.body.appendChild(overlay);

  // code to animate the countdown circle thing
  const duration = 10; // sec; change this to change the countdown duration
  let timeLeft = duration;
  const textEl = document.getElementById("countdown-text");
  const circle = document.getElementById("progress-circle");
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;

  const interval = setInterval(() => {
    timeLeft--;
    const offset = circumference - (timeLeft / duration) * circumference;
    circle.style.strokeDashoffset = offset;
    textEl.textContent = timeLeft;

    if (timeLeft <= 0) {    // once time is up, stop the interval from repeating
      clearInterval(interval);
      overlay.remove();
    }
  }, 1000);
}
