"use client"

import { FormEvent, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MdLockOutline } from "react-icons/md"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!response.ok) throw new Error("Invalid password")
      const destination = searchParams.get("from")
      router.replace(destination && destination.startsWith("/") ? destination : "/")
    } catch {
      setError("That password was not accepted.")
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#5865f2]"><MdLockOutline size={25} /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Private dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Enter the dashboard password configured in Railway Variables.</p>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="dashboard-password">Password</label>
        <input id="dashboard-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" required />
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isLoading} className="mt-5 h-12 w-full rounded-xl bg-[#5865f2] text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:opacity-50">{isLoading ? "Checking…" : "Open dashboard"}</button>
      </form>
    </main>
  )
}
