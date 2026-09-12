"use client"

import { useEffect, useMemo, useState } from "react"
import { Letter } from "react-letter"
import {
  MdArrowForward,
  MdCheck,
  MdContentCopy,
  MdInfoOutline,
  MdMailOutline,
  MdOpenInNew,
  MdRefresh,
  MdShield,
  MdAutorenew,
  MdGroups,
  MdDashboard,
  MdDeleteOutline,
} from "react-icons/md"

import { EmailMessage } from "@/lib/types"

const INBOX_GENERATE_URL = "https://faas-fra1-afec6ce7.doserverless.co/api/v1/web/fn-fe0afd4a-8adb-4bd1-8b1f-8f8feb60a91d/default/generate"
const INBOX_MESSAGES_URL = "https://faas-fra1-afec6ce7.doserverless.co/api/v1/web/fn-fe0afd4a-8adb-4bd1-8b1f-8f8feb60a91d/default/auth"
const USERNAMES = ["bright", "calm", "clever", "cosmic", "fresh", "happy", "kind", "lunar", "mellow", "quick", "quiet", "solar", "steady", "swift", "tidy", "vivid"]
const FIRST_NAMES = ["Avery", "Casey", "Elliot", "Jordan", "Kai", "Maya", "Nora", "Riley", "Sasha", "Taylor", "Theo", "Zoe"]
const LAST_NAMES = ["Adams", "Bennett", "Brooks", "Carter", "Davis", "Ellis", "Foster", "Hayes", "Morgan", "Parker", "Reed", "Wright"]

const pick = (values: string[]) => values[Math.floor(Math.random() * values.length)]
const makePassword = () => {
  const groups = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789", "!@#$%^&*_-+=?"]
  const chars = groups.map(group => pick(group.split("")))
  const all = groups.join("")
  while (chars.length < 16) chars.push(pick(all.split("")))
  return chars.sort(() => Math.random() - 0.5).join("")
}
const makeProfile = () => {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  return {
    firstName,
    lastName,
    displayName: firstName + " " + lastName,
    username: pick(USERNAMES) + pick(USERNAMES) + Math.floor(1000 + Math.random() * 9000),
    password: makePassword(),
  }
}
const formatMessageDate = (date: number) => date ? new Date(date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : ""


type AccountWorkspace = {
  id: string
  name: string
  displayName: string
  username: string
  email: string
  inviteUrl: string
  createdAt: string
  steps: {
    profile: boolean
    invite: boolean
    inbox: boolean
    captcha: boolean
  }
}

type FieldProps = { label: string; value: string; onCopy: () => void; copied: boolean; masked?: boolean }
const IdentityField = ({ label, value, onCopy, copied, masked = false }: FieldProps) => (
  <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-indigo-300 hover:shadow-sm">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={"mt-1 truncate text-sm font-medium text-slate-800 " + (masked ? "tracking-[0.18em]" : "")}>{value || "Loading…"}</p>
    </div>
    <button type="button" onClick={onCopy} disabled={!value} aria-label={"Copy " + label} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-30">
      {copied ? <MdCheck className="text-emerald-600" size={20} /> : <MdContentCopy size={18} />}
    </button>
  </div>
)

export default function Home() {
  const [profile, setProfile] = useState(makeProfile)
  const [emailAddress, setEmailAddress] = useState("")
  const [emailToken, setEmailToken] = useState("")
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([])
  const [inviteUrl, setInviteUrl] = useState("")
  const [copiedField, setCopiedField] = useState("")
  const [isInboxLoading, setIsInboxLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [error, setError] = useState("")

  const [workspaces, setWorkspaces] = useState<AccountWorkspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("")
  const [workspaceName, setWorkspaceName] = useState("Discord project 1")
  const [isWorkspaceHydrated, setIsWorkspaceHydrated] = useState(false)

  const allFields = useMemo(() => [
    ["Display name", profile.displayName],
    ["Username", profile.username],
    ["Password", profile.password],
    ["Email", emailAddress],
  ].map(item => item[0] + ": " + item[1]).join("\\n"), [profile, emailAddress])


  const activeWorkspace = useMemo(() => workspaces.find(workspace => workspace.id === activeWorkspaceId), [workspaces, activeWorkspaceId])

  const createWorkspace = () => {
    const workspace: AccountWorkspace = {
      id: Date.now().toString(),
      name: workspaceName.trim() || "Discord project " + (workspaces.length + 1),
      displayName: profile.displayName,
      username: profile.username,
      email: emailAddress,
      inviteUrl,
      createdAt: new Date().toISOString(),
      steps: { profile: false, invite: false, inbox: false, captcha: false },
    }
    setWorkspaces(current => [workspace, ...current])
    setActiveWorkspaceId(workspace.id)
    setWorkspaceName("Discord project " + (workspaces.length + 2))
  }

  const toggleWorkspaceStep = (workspaceId: string, step: keyof AccountWorkspace["steps"]) => {
    setWorkspaces(current => current.map(workspace => workspace.id === workspaceId
      ? { ...workspace, steps: { ...workspace.steps, [step]: !workspace.steps[step] } }
      : workspace
    ))
  }

  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces(current => current.filter(workspace => workspace.id !== workspaceId))
    if (activeWorkspaceId === workspaceId) setActiveWorkspaceId("")
  }

  const copyValue = async (label: string, value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(label)
      window.setTimeout(() => setCopiedField(""), 1800)
    } catch {
      setError("Clipboard access was blocked. Select the value and copy it manually.")
    }
  }

  const generateInbox = async () => {
    setIsInboxLoading(true)
    setError("")
    setEmailMessages([])
    try {
      const response = await fetch(INBOX_GENERATE_URL)
      if (!response.ok) throw new Error("Inbox unavailable")
      const data = await response.json()
      setEmailAddress(data && data.address ? data.address : "")
      setEmailToken(data && data.token ? data.token : "")
    } catch {
      setError("The temporary inbox could not be reached. You can still use the generated Discord test profile.")
    } finally {
      setIsInboxLoading(false)
    }
  }

  const generateProfile = () => {
    setProfile(makeProfile())
    void generateInbox()
  }

  const fetchMessages = async () => {
    if (!emailToken) return
    setIsMessagesLoading(true)
    setError("")
    try {
      const response = await fetch(INBOX_MESSAGES_URL + "?token=" + encodeURIComponent(emailToken))
      if (!response.ok) throw new Error("Messages unavailable")
      const data = await response.json()
      setEmailMessages(data && Array.isArray(data.email) ? data.email : [])
    } catch {
      setError("Messages could not be loaded right now. Try again in a moment.")
    } finally {
      setIsMessagesLoading(false)
    }
  }

  const openInvite = () => {
    try {
      const url = new URL(inviteUrl)
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol")
      window.open(url.toString(), "_blank", "noopener,noreferrer")
    } catch {
      setError("Enter a full Discord invite or authorized server URL beginning with https://")
    }
  }


  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("discord-qa-workspaces")
      if (saved) {
        const parsed = JSON.parse(saved) as AccountWorkspace[]
        setWorkspaces(parsed)
        if (parsed[0]) setActiveWorkspaceId(parsed[0].id)
      }
    } catch {
      setError("Saved workspaces could not be loaded in this browser.")
    } finally {
      setIsWorkspaceHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (isWorkspaceHydrated) window.localStorage.setItem("discord-qa-workspaces", JSON.stringify(workspaces))
  }, [workspaces, isWorkspaceHydrated])

  useEffect(() => { void generateInbox() }, [])

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Discord QA Kit</div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Your Discord QA profile, ready in one click.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">Keep your QA profile together, copy each field instantly, open an authorized server invite, and check test emails in one place.</p>
          </div>
          <button type="button" onClick={generateProfile} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#5865f2] px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#4752c4]"><MdAutorenew size={19} /> New test profile</button>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">01</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Generate</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Create a fresh QA profile and temporary inbox.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">02</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Copy</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Use Copy all fields instead of copying each value.</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">03</p>
            <p className="mt-2 text-sm font-semibold text-amber-950">Verify manually</p>
            <p className="mt-1 text-xs leading-5 text-amber-900/70">Complete Discord CAPTCHA yourself when it appears.</p>
          </div>
        </section>

        {error && <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><MdInfoOutline className="mt-0.5 shrink-0" size={19} /><span>{error}</span></div>}

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><MdDashboard className="text-[#5865f2]" size={20} /> Account workspaces</div>
              <p className="mt-1 text-sm text-slate-500">Create a Project 1-style dashboard after you manually finish an authorized test account.</p>
            </div>
            <div className="flex w-full gap-2 sm:max-w-md">
              <input value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} aria-label="Workspace name" placeholder="Discord project 1" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400" />
              <button type="button" onClick={createWorkspace} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"><MdCheck size={17} /> Account created</button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {workspaces.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-400 md:col-span-3">No workspaces yet. Finish your authorized Discord test account, then click Account created.</div>}
            {workspaces.map(workspace => <button type="button" key={workspace.id} onClick={() => setActiveWorkspaceId(workspace.id)} className={"rounded-2xl border p-4 text-left transition " + (workspace.id === activeWorkspaceId ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-indigo-200")}><p className="truncate text-sm font-semibold text-slate-900">{workspace.name}</p><p className="mt-1 truncate text-xs text-slate-500">{workspace.displayName} · {workspace.username}</p><p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">{Object.values(workspace.steps).filter(Boolean).length}/4 complete</p></button>)}
          </div>
          {activeWorkspace && <div className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{activeWorkspace.name}</p><p className="mt-1 text-xs text-slate-500">{activeWorkspace.email || "No inbox captured"} · Passwords are never saved here.</p></div><button type="button" onClick={() => deleteWorkspace(activeWorkspace.id)} className="inline-flex items-center gap-1 self-start text-xs font-semibold text-slate-400 transition hover:text-red-600"><MdDeleteOutline size={17} /> Delete workspace</button></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {([["profile", "Profile copied"], ["invite", "Authorized invite opened"], ["inbox", "Verification inbox checked"], ["captcha", "CAPTCHA completed manually"]] as [keyof AccountWorkspace["steps"], string][]).map(item => <button type="button" key={item[0]} onClick={() => toggleWorkspaceStep(activeWorkspace.id, item[0])} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-xs font-medium text-slate-700"><span className={"flex h-5 w-5 items-center justify-center rounded-full border " + (activeWorkspace.steps[item[0]] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent")}><MdCheck size={14} /></span>{item[1]}</button>)}
            </div>
          </div>}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-950">Discord test profile</p><p className="mt-1 text-sm text-slate-500">Use these values only in an account or server you own or are authorized to test.</p></div><div className="rounded-2xl bg-indigo-50 p-3 text-[#5865f2]"><MdShield size={22} /></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2"><IdentityField label="Display name" value={profile.displayName} onCopy={() => copyValue("Display name", profile.displayName)} copied={copiedField === "Display name"} /></div>
              <IdentityField label="Username" value={profile.username} onCopy={() => copyValue("Username", profile.username)} copied={copiedField === "Username"} />
              <IdentityField label="Password" value={profile.password} masked onCopy={() => copyValue("Password", profile.password)} copied={copiedField === "Password"} />
              <div className="sm:col-span-2"><IdentityField label="Email address" value={emailAddress} onCopy={() => copyValue("Email", emailAddress)} copied={copiedField === "Email"} /></div>
            </div>
            <button type="button" onClick={() => copyValue("All fields", allFields)} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#5865f2] text-sm font-semibold text-white transition hover:bg-[#4752c4]">{copiedField === "All fields" ? <MdCheck className="text-emerald-600" size={20} /> : <MdContentCopy size={19} />}{copiedField === "All fields" ? "Copied all fields" : "Copy all fields"}</button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[2rem] bg-[#e9eafe] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-950">Step 2: Open the authorized invite</p><p className="mt-1 text-sm leading-6 text-indigo-900/70">Launch an authorized Discord invite or QA workspace in a new tab. Discord verification remains manual.</p></div><MdGroups className="text-[#5865f2]" size={23} /></div>
              <div className="mt-5 flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm"><input value={inviteUrl} onChange={event => setInviteUrl(event.target.value)} placeholder="https://discord.gg/your-invite" aria-label="Discord invite URL" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400" /><button type="button" onClick={openInvite} aria-label="Open Discord invite" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5865f2] text-white transition hover:bg-[#4752c4]"><MdArrowForward size={20} /></button></div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><MdMailOutline size={20} /> Verification inbox</div><p className="mt-2 text-xs leading-5 text-slate-500">For authorized QA only. Messages may expire and should not contain sensitive information.</p></div><button type="button" onClick={fetchMessages} disabled={!emailToken || isMessagesLoading} aria-label="Refresh inbox" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"><MdRefresh className={isMessagesLoading ? "animate-spin" : ""} size={21} /></button></div>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4"><p className="break-all text-sm font-semibold text-slate-800">{isInboxLoading ? "Creating inbox…" : emailAddress || "Inbox unavailable"}</p><p className="mt-1 text-xs text-slate-500">{emailAddress ? "Temporary address" : "Generate a new profile to retry"}</p></div>
              <div className="mt-4 space-y-3">{emailMessages.length === 0 && <p className="py-3 text-center text-sm text-slate-400">No messages yet. Refresh after sending a test email.</p>}{emailMessages.map((message, index) => <article key={message.date + "-" + index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{message.subject || "Untitled message"}</p><span className="shrink-0 text-[11px] text-slate-400">{formatMessageDate(message.date)}</span></div>{message.from && <p className="mt-1 text-xs text-slate-500">From {message.from}</p>}{message.body && <div className="mt-3 text-sm text-slate-600"><Letter html={message.body} /></div>}</article>)}</div>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>For authorized Discord QA and development testing only.</span><span className="inline-flex items-center gap-1.5"><MdOpenInNew size={15} /> CAPTCHA and verification must always be completed manually.</span></footer>
      </div>
    </main>
  )
}
