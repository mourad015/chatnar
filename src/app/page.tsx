import { redirect } from 'next/navigation'

// The louage app (Blassa) lives under /louage for now.
export default function Home() {
  redirect('/louage')
}
