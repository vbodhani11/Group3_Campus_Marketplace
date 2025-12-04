import { useState } from "react";
import "../../style/studentmessages.scss";

interface Message {
  id: number;
  from: string;
  preview: string;
  time: string;
  full: string[];
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    from: "Alex P.",
    preview: "Hi! Is your Dell XPS still available?",
    time: "2:45 PM",
    full: [
      "Hi! Is your Dell XPS still available?",
      "Yes, it is! It’s in great condition.",
      "Awesome — can I see it tomorrow around noon?",
      "Sure, let's meet near the library.",
    ],
  },
  {
    id: 2,
    from: "Maya R.",
    preview: "Hey, can you do $50 for the textbook set?",
    time: "Yesterday",
    full: [
      "Hey, can you do $50 for the textbook set?",
      "I can go down to $55, would that work?",
    ],
  },
];

export default function StudentMessages() {
  const [selected, setSelected] = useState<Message | null>(MOCK_MESSAGES[0]);

  return (
    <section className="student-messages">
      <div className="card">
        <h1>Messages</h1>
        <p className="muted-sub">
          View and reply to buyer or seller messages below.
        </p>

        <div className="message-layout">
          {/* Sidebar: Message list */}
          <aside className="inbox">
            {MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`inbox-item ${
                  selected?.id === msg.id ? "is-active" : ""
                }`}
                onClick={() => setSelected(msg)}
              >
                <div className="inbox-header">
                  <span className="sender">{msg.from}</span>
                  <span className="time">{msg.time}</span>
                </div>
                <p className="preview">{msg.preview}</p>
              </div>
            ))}
          </aside>

          {/* Chat view */}
          <main className="chat">
            {selected ? (
              <>
                <div className="chat-header">
                  <strong>{selected.from}</strong>
                  <span className="chat-status">Active</span>
                </div>

                <div className="chat-body">
                  {selected.full.map((line, i) => (
                    <div
                      key={i}
                      className={`bubble ${
                        i % 2 === 0 ? "incoming" : "outgoing"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <form className="chat-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="msg-box"
                  />
                  <button className="btn primary" type="submit">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
