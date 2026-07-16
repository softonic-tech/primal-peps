import { useCart } from '../context/CartContext'
import { useReveal } from '../hooks/useReveal'

export default function Points() {
  const { lifetimePoints } = useCart()
  const hairRef = useReveal({ threshold: 0.5 })
  const ladderRef = useReveal()
  const copyRef = useReveal()
  const fill = Math.min(100, (lifetimePoints / 1500) * 100)

  return (
    <section className="points-sec section" id="points">
      <div className="wrap">
        <div className="hairline rv" ref={hairRef} />
        <div className="points-layout" style={{ marginTop: 48 }}>
          <div className="rank-ladder rv" ref={ladderRef}>
            <div className="rank-node active">
              <div className="rank-silhouette">🦍</div>
              <div>
                <h4>APE</h4>
                <small>0+ pts</small>
              </div>
            </div>
            <div className="rank-node">
              <div className="rank-silhouette">🦍</div>
              <div>
                <h4>ALPHA</h4>
                <small>500+ pts</small>
              </div>
            </div>
            <div className="rank-node">
              <div className="rank-silhouette">🦍</div>
              <div>
                <h4>SILVERBACK</h4>
                <small>1,500+ pts</small>
              </div>
            </div>
          </div>
          <div>
            <div className="points-copy rv" ref={copyRef}>
              <span className="eyebrow">Rewards program</span>
              <h2
                className="display"
                style={{
                  fontSize: 'clamp(2.6rem,4.6vw,3.8rem)',
                  lineHeight: 1,
                  marginTop: 14,
                }}
              >
                PRIMAL <span style={{ color: 'var(--gold-hi)' }}>POINTS</span>
              </h2>
              <p>
                Every order makes the next one cheaper. Rack up points
                automatically at checkout, then trade them in for discounts and
                free gifts — no hoops, no fine print.
              </p>
              <ul className="how">
                <li>
                  <span className="n">1</span>
                  <div>
                    <b>Shop like normal</b>
                    <span>Earn 2 points for every $1 you spend.</span>
                  </div>
                </li>
                <li>
                  <span className="n">2</span>
                  <div>
                    <b>Watch your rank climb</b>
                    <span>
                      Points stack across every order — they never reset.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="n">3</span>
                  <div>
                    <b>Cash them in</b>
                    <span>
                      Redeem for discounts, free vials, and members-only drops.
                    </span>
                  </div>
                </li>
              </ul>
              <a href="#shop" className="btn-primary magnetic">
                Start earning →
              </a>
              <div className="meter">
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    id="meterFill"
                    style={{ width: `${fill}%` }}
                  />
                </div>
                <div className="meter-labels">
                  <span>Ape</span>
                  <span>Alpha</span>
                  <span>Silverback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
