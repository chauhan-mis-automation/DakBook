import { useEffect, useMemo, useState } from 'react'
import { IconClose, IconDownload, IconAlert } from './Icons'
import { checkRows, exportIndiaPost } from '../lib/indiaPostExport'
import { formatINR } from '../lib/amountToWords'

const FORMATS = [
  { value: 'xlsx', title: 'India Post Excel (.xlsx)', text: 'Client wala format, 4 sheets. Seedha upload ke liye.' },
  { value: 'csv', title: 'CSV (.csv)', text: 'Sirf ArticleDetails ka data, same columns.' },
]

export default function ExportDialog({ rows, rangeLabel, fileSuffix, onClose, onDone }) {
  const [format, setFormat] = useState('xlsx')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const issues = useMemo(() => checkRows(rows), [rows])
  const codTotal = rows.reduce((a, r) => a + Number(r.cod_amount || 0), 0)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function go() {
    setBusy(true)
    setError('')
    try {
      await exportIndiaPost(rows, { format, filename: `IndiaPost_Booking_${fileSuffix}` })
      onDone?.(rows.length)
    } catch (e) {
      setError(e.message || 'File nahi ban payi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-print" role="dialog" aria-labelledby="export-title">
        <header className="modal-head">
          <div>
            <h2 id="export-title">Export {rows.length} {rows.length === 1 ? 'parcel' : 'parcels'}</h2>
            <p>{rangeLabel} · COD total {formatINR(codTotal)}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </header>

        <div className="modal-body">
          <div className="print-options" role="radiogroup">
            {FORMATS.map((f) => (
              <label key={f.value} className={`print-opt ${format === f.value ? 'is-on' : ''}`}>
                <input type="radio" name="format" checked={format === f.value} onChange={() => setFormat(f.value)} />
                <span className={`file-badge file-${f.value}`}>{f.value.toUpperCase()}</span>
                <span className="print-opt-text">
                  <b>{f.title}</b>
                  <small>{f.text}</small>
                </span>
              </label>
            ))}
          </div>

          {issues.length > 0 && (
            <div className="export-issues">
              <p><IconAlert /> Upload se pehle ek baar dekh lein:</p>
              <ul>{issues.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          )}
          {error && <p className="form-error" style={{ marginTop: '1rem' }}>{error}</p>}
        </div>

        <footer className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={go} disabled={busy || !rows.length} autoFocus>
            <IconDownload /> {busy ? 'Ban raha hai…' : 'Download'}
          </button>
        </footer>
      </div>
    </div>
  )
}
