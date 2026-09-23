import { useEffect, useState } from 'react'
import { IconClose, IconPrint } from './Icons'

const KEY = 'dakbook_per_page'

export function getSavedPerPage() {
  try {
    return Number(localStorage.getItem(KEY)) === 4 ? 4 : 1
  } catch {
    return 1
  }
}

const OPTIONS = [
  { value: 1, title: '1 label per page', text: 'Bada label, poora A4 page. Parcel pe seedha chipkane ke liye.' },
  { value: 4, title: '4 labels per A4', text: 'Chhote labels, 2 x 2. Kaagaz bachta hai, kaat ke lagao.' },
]

function Thumb({ n }) {
  return (
    <div className={`thumb thumb-${n}`} aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => <span key={i} />)}
    </div>
  )
}

export default function PrintDialog({ count, onPrint, onClose }) {
  const [perPage, setPerPage] = useState(getSavedPerPage)
  const pages = Math.ceil(count / perPage)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function go() {
    try { localStorage.setItem(KEY, String(perPage)) } catch { /* ignore */ }
    onPrint(perPage)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-print" role="dialog" aria-labelledby="print-title">
        <header className="modal-head">
          <div>
            <h2 id="print-title">Print {count} {count === 1 ? 'label' : 'labels'}</h2>
            <p>A4 page pe kitne labels chahiye?</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </header>
        <div className="modal-body">
          <div className="print-options" role="radiogroup">
            {OPTIONS.map((o) => (
              <label key={o.value} className={`print-opt ${perPage === o.value ? 'is-on' : ''}`}>
                <input type="radio" name="perPage" checked={perPage === o.value} onChange={() => setPerPage(o.value)} />
                <Thumb n={o.value} />
                <span className="print-opt-text">
                  <b>{o.title}</b>
                  <small>{o.text}</small>
                </span>
              </label>
            ))}
          </div>
          <p className="muted small print-summary">
            {pages} A4 {pages === 1 ? 'page' : 'pages'} print honge.
          </p>
        </div>
        <footer className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={go} autoFocus><IconPrint /> Print</button>
        </footer>
      </div>
    </div>
  )
}
