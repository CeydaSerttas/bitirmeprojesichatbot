import { useState, useEffect, useRef } from "react";
import "./index.css";

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! How can I assist you today?",
      time: getTime(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getTime() {
    const now = new Date();
    return (
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0")
    );
  }

  function handleSendMessage() {
    if (!inputText.trim()) return;

    const userMessage = { sender: "user", text: inputText, time: getTime() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    handleBotReply();
  }

  function handleBotReply() {
    setIsTyping(true);

    const typingMessage = {
      sender: "bot",
      text: "Typing...",
      time: getTime(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    setTimeout(() => {
      updateLastBotMessage("This is a demo reply from the AI bot.");
      setIsTyping(false);
    }, 1500);
  }

  function updateLastBotMessage(text) {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { sender: "bot", text, time: getTime() };
      return updated;
    });
  }

  function handleStartListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInputText(speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
    };
  }

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <div className="chat-app">
        <div className="chat-header">
          AI Chatbot
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              fontSize: "14px",
            }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <div className="chat-bubble">
                {msg.isTyping ? (
                  <div className="typing-indicator">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                ) : (
                  <div className="message-text">{msg.text}</div>
                )}
                <div className="message-time">{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button className="mic-button" onClick={handleStartListening}>
            🎙️
          </button>
          <button className="send-button" onClick={handleSendMessage}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
