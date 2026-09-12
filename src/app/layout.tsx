import "./globals.css"

export const metadata = {
  title: "Discord QA Kit",
  description: "A focused assistant for authorized Discord QA and server onboarding.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
