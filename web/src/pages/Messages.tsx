import { useEffect, useMemo, useState } from "react"
import Layout from "../layout/Layout"

type Message = {
  id: string
  fromMe: boolean
  text: string
  ts: number
}

type Conversation = {
  id: string
  peer: string
  preview: string
  messages: Message[]
}

const STORAGE_KEY = "cm_messages_v1"

/** seed some demo conversations on first load */
function seed(): Conversation[] {
  const now = Date.now()
  return [
    {
      id: "c1",
      peer: "Alex P. (Calc Dept)",
      preview: "Is this still available?",
      messages: [
        { id: "m1", fromMe: false, text: "Is this still available?", ts: now - 1000 * 60 * 60 * 5 },
        { id: "m2", fromMe: true,  text: "Yep! Pickup at the library works.", ts: now - 1000 * 60 * 60 * 4.5 },
        { id: "m3", fromMe: false, text: "Great. Tomorrow afternoon?", ts: now - 1000 * 60 * 60 * 4.2 },
      ],
    },
    {
      id: "c2",
      peer: "Maya R.",
      preview: "Can you do $40?",
      messages: [
        { id: "m1", fromMe: false, text: "Can you do $40?", ts: now - 1000 * 60 * 60 * 8 },
        { id: "m2", fromMe: true,  text: "I can do $45.", ts: now - 1000 * 60 * 60 * 7.7 },
      ],
    },
    {
      id: "c3",
      peer: "Chris J.",
      preview: "Where do we meet?",
      messages: [
        { id: "m1", fromMe: false, text: "Where do we meet?", ts: now - 1000 * 60 * 60 * 24 },
      ],
    },
  ]
}

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    return JSON.parse(raw)
  } catch { return seed() }
}

function save(data: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export default function Messages() {
  const [convos, setConvos] = useState<Conversation[]>(load)
  const [activeId, setActiveId] = useState<string>(() => (load()[0]?.id ?? ""))
  const active = useMemo(() => convos.find(c => c.id === activeId) ?? null, [convos, activeId])

  useEffect(() => { save(convos) }, [convos])

  function selectConversation(id: string) { setActiveId(id) }

  function sendMessage(text: string) {
    if (!text.trim() || !active) return
    const newMsg: Message = { id: crypto.randomUUID(), fromMe: true, text: text.trim(), ts: Date.now() }
    setConvos(prev =>
      prev.map(c =>
        c.id === active.id
          ? { ...c, preview: newMsg.text, messages: [...c.messages, newMsg] }
          : c
      )
    )
  }

  // mobile: if no active, pick first
  useEffect(() => {
    if (!activeId && convos.length) setActiveId(convos[0].id)
  }, [activeId, convos])

  return (
    <Layout title="Messages">
      <div className="msg-wrap">
        {/* Sidebar */}
        <aside className="msg-sidebar" aria-label="Conversations">
          {convos.length === 0 ? (
            <div className="msg-empty">No conversations yet.</div>
          ) : (
            <ul className="msg-list" role="list">
              {convos.map(c => {
                const isActive = c.id === activeId
                return (
                  <li
                    key={c.id}
                    className={`msg-item ${isActive ? "is-active" : ""}`}
                    onClick={() => selectConversation(c.id)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" ? selectConversation(c.id) : null)}
                  >
                    <div className="msg-peer">{c.peer}</div>
                    <div className="msg-preview">{c.preview}</div>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        {/* Thread */}
        <section className="msg-thread" aria-label="Thread">
          {!active ? (
            <div className="msg-thread-empty pfw-muted">Select a conversation to start messaging.</div>
          ) : (
            <>
              <header className="msg-thread-header">
                <div className="msg-peer-strong">{active.peer}</div>
              </header>

              <div className="msg-scroll" id="msg-scroll">
                {active.messages.map(m => (
                  <div key={m.id} className={`bubble-row ${m.fromMe ? "me" : "them"}`}>
                    <div className={`bubble ${m.fromMe ? "bubble-me" : "bubble-them"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <Composer onSend={sendMessage} />
            </>
          )}
        </section>
      </div>
    </Layout>
  )
}

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("")
  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSend(text)
    setText("")
    // scroll to bottom after send
    const el = document.getElementById("msg-scroll")
    if (el) el.scrollTop = el.scrollHeight
  }
  return (
    <form className="composer" onSubmit={submit}>
      <input
        className="pfw-input composer-input"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="pfw-btn pfw-btn--primary" type="submit">Send</button>
    </form>
  )
}
