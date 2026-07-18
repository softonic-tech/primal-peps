import { statusShort } from '../lib/supabase'

/** Full label on desktop, short one-line label on mobile */
export default function StatusLabel({ status }) {
  const short = statusShort(status)
  if (short === status) return status
  return (
    <>
      <span className="lbl-full">{status}</span>
      <span className="lbl-short">{short}</span>
    </>
  )
}
