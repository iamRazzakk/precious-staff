import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Search, Smile, Image as ImageIcon, Paperclip, Send } from 'lucide-react'

const TEAL = '#3FA8A8'
const TEAL_DARK = '#2A8585'

type Message = {
  id: string
  text: string
  time: string
  sender: 'me' | 'them'
}

type Conversation = {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  avatarColor: string
  messages: Message[]
}

const AVATAR_PALETTE = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899']

const initialConversations: Conversation[] = [
  {
    id: 'zaima',
    name: 'ZAIMA',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    time: '2 min ago',
    unread: 0,
    online: true,
    avatarColor: AVATAR_PALETTE[0],
    messages: [
      {
        id: 'm1',
        sender: 'them',
        time: '10:30 AM',
        text: "Hi! I'm interested in booking your Beachfront Villa for next month.",
      },
      {
        id: 'm2',
        sender: 'me',
        time: '10:30 AM',
        text: 'Hello! Thank you for your interest. The villa is available for those dates',
      },
      {
        id: 'm3',
        sender: 'them',
        time: '10:30 AM',
        text: 'Yes, please! Also, is it close to the beach?',
      },
      {
        id: 'm4',
        sender: 'me',
        time: '10:30 AM',
        text: 'The villa is directly on the beach with private access. It has 4 bedrooms, 3 bathrooms, a full kitchen, and a pool',
      },
    ],
  },
  {
    id: 'zabin',
    name: 'ZABIN',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    time: '2 min ago',
    unread: 2,
    online: false,
    avatarColor: AVATAR_PALETTE[1],
    messages: [
      { id: 'b1', sender: 'them', time: '9:12 AM', text: 'Hello, are you available next weekend?' },
      { id: 'b2', sender: 'them', time: '9:13 AM', text: 'Thank you ! Looking forward to our stay.' },
    ],
  },
  {
    id: 'sarah',
    name: 'SARAH',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    time: '2 min ago',
    unread: 2,
    online: true,
    avatarColor: AVATAR_PALETTE[2],
    messages: [
      { id: 's1', sender: 'them', time: 'Yesterday', text: 'Is breakfast included?' },
      { id: 's2', sender: 'them', time: 'Yesterday', text: 'Thank you ! Looking forward to our stay.' },
    ],
  },
  {
    id: 'elonia',
    name: 'ELONIA',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    time: '2 min ago',
    unread: 2,
    online: false,
    avatarColor: AVATAR_PALETTE[3],
    messages: [
      { id: 'e1', sender: 'them', time: 'Mon', text: 'Thank you ! Looking forward to our stay.' },
    ],
  },
  {
    id: 'evanka',
    name: 'EVANKA',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    time: '2 min ago',
    unread: 2,
    online: false,
    avatarColor: AVATAR_PALETTE[4],
    messages: [
      { id: 'v1', sender: 'them', time: 'Sun', text: 'Thank you ! Looking forward to our stay.' },
    ],
  },
  {
    id: 'pritha',
    name: 'PRITHA',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    time: '2 min ago',
    unread: 2,
    online: true,
    avatarColor: AVATAR_PALETTE[5],
    messages: [
      { id: 'p1', sender: 'them', time: 'Fri', text: 'Thank you ! Looking forward to our stay.' },
    ],
  },
]

const Avatar = ({
  name,
  color,
  size = 40,
  ring,
}: {
  name: string
  color: string
  size?: number
  ring?: boolean
}) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none"
    style={{
      width: size,
      height: size,
      background: color,
      fontSize: Math.round(size * 0.4),
      boxShadow: ring ? '0 0 0 2px #fff' : undefined,
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
)

const ChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q),
    )
  }, [conversations, search])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active.messages.length, activeId])

  const handleSelect = (id: string) => {
    setActiveId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    )
  }

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return
    const now = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMessage: text,
              time: 'just now',
              messages: [
                ...c.messages,
                { id: `m-${Date.now()}`, sender: 'me', time: now, text },
              ],
            }
          : c,
      ),
    )
    setDraft('')
  }

  return (
    <div className="px-8 py-7" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 h-full">
        {/* Conversations list */}
        <div className="bg-bg-card border border-border-light rounded-2xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-border-light">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-light bg-bg-input text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-border"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filtered.length === 0 ? (
              <div className="text-sm text-text-muted text-center py-10">
                No conversations match "{search}"
              </div>
            ) : (
              filtered.map((c) => {
                const isActive = c.id === activeId
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className="w-full text-left rounded-xl p-3 flex items-center gap-3 border-0 cursor-pointer transition-colors"
                    style={{
                      background: isActive ? TEAL : '#fff',
                      color: isActive ? '#fff' : 'inherit',
                      boxShadow: isActive ? 'none' : '0 0 0 1px #F1F5F9',
                    }}
                  >
                    <Avatar name={c.name} color={c.avatarColor} size={44} ring={isActive} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-sm font-bold truncate"
                          style={{ letterSpacing: 0.3 }}
                        >
                          {c.name}
                        </span>
                        <span
                          className="text-xs whitespace-nowrap"
                          style={{ color: isActive ? 'rgba(255,255,255,0.85)' : '#94A3B8' }}
                        >
                          {c.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span
                          className="text-xs truncate"
                          style={{ color: isActive ? 'rgba(255,255,255,0.9)' : '#475569' }}
                        >
                          {c.lastMessage}
                        </span>
                        {c.unread > 0 && (
                          <span
                            className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
                            style={{ background: TEAL }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Active chat */}
        <div className="bg-bg-card border border-border-light rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-center gap-3">
            <Avatar name={active.name} color={active.avatarColor} size={44} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-text-primary tracking-wide">
                {active.name}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                {active.online ? (
                  <>
                    Active Now
                    <span className="w-2 h-2 rounded-full bg-success inline-block" />
                  </>
                ) : (
                  <span className="text-text-muted">Offline</span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            <div className="text-center text-xs text-text-muted">Today</div>

            {active.messages.map((m) => {
              const mine = m.sender === 'me'
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[75%] rounded-2xl px-4 py-3"
                    style={
                      mine
                        ? {
                            background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
                            color: '#fff',
                          }
                        : { background: '#F1F5F9', color: '#0F172A' }
                    }
                  >
                    <div className="text-sm leading-snug">{m.text}</div>
                    <div
                      className="text-[11px] mt-1.5"
                      style={{
                        color: mine ? 'rgba(255,255,255,0.85)' : '#94A3B8',
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-border-light flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message"
                className="w-full h-12 pl-4 pr-32 rounded-xl border border-border-light bg-bg-input text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-border"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-text-muted">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer flex items-center justify-center hover:bg-bg-card"
                  title="Emoji"
                >
                  <Smile size={18} />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer flex items-center justify-center hover:bg-bg-card"
                  title="Image"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer flex items-center justify-center hover:bg-bg-card"
                  title="Attachment"
                >
                  <Paperclip size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!draft.trim()}
              className="w-12 h-12 rounded-xl border-0 flex items-center justify-center text-white"
              style={{
                background: draft.trim() ? TEAL : '#9CB5C7',
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
              }}
              title="Send"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
