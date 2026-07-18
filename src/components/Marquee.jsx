const ITEMS = [
  'Third-party tested',
  '99%+ purity',
  'Ships in 24h',
  'Research use only',
  'Not for human consumption',
  '18+ to purchase',
  'Bank transfer payment',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span className="marquee-item" key={`${item}-${i}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
