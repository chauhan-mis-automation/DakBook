import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { db } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { formatINR } from '../lib/amountToWords'
import { STATUSES } from '../lib/fields'
import ShipmentForm from '../components/ShipmentForm'
import PrintLabels, { Label } from '../components/PrintLabels'
import PrintDialog from '../components/PrintDialog'
import ExportDialog from '../components/ExportDialog'
import { useToast } from '../components/Toast'
import { IconPlus, IconPrint, IconSearch, IconEdit, IconTrash, IconEye, IconClose, IconRefresh, IconDownload, IconCalendar } from '../components/Icons'

const FILTERS = [{ value: 'all', label: 'All' }, ...STATUSES]

// Local date ko YYYY-MM-DD mein (date input isi format mein deta hai)
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA')
const niceDate = (k) => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// Khaali strings ko null bana do, number ko number
function clean(form) {
  const out = {}
  const skip = ['id', 'created_at', 'created_by']
  for (const [k, val] of Object.entries(form)) {
    if (skip.includes(k)) continue
    out[k] = typeof val === 'string' ? (val.trim() === '' ? null : val.trim()) : val
  }
  out.cod_amount = out.cod_amount == null ? null : Number(out.cod_amount)
  return out
}

export default function Parcels() {
  const { expire } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [editing, setEditing] = useState(null) // null = band, {} = naya, row = edit
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [printRows, setPrintRows] = useState([])
  const [printAsk, setPrintAsk] = useState(null) // print dialog ke liye rows
  const [perPage, setPerPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await db().from('shipments').select('*').order('created_at', { ascending: false })
    if (error) toast(error.message, 'err')
    setRows(data || [])
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (params.get('new')) {
      setEditing({})
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false
      const day = dayKey(r.created_at)
      if (fromDate && day < fromDate) return false
      if (toDate && day > toDate) return false
      if (!q) return true
      return [r.receiver_name, r.barcode_no, r.order_id, r.mobile_no, r.pincode, r.district, r.state]
        .some((x) => x && String(x).toLowerCase().includes(q))
    })
  }, [rows, search, filter, fromDate, toDate])

  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id))

  function toggle(id) {
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleAll() {
    setSelected((s) => {
      const n = new Set(s)
      if (allVisibleSelected) visible.forEach((r) => n.delete(r.id))
      else visible.forEach((r) => n.add(r.id))
      return n
    })
  }

  async function save(form) {
    setSaving(true)
    const payload = clean(form)
    const query = form.id
      ? db().from('shipments').update(payload).eq('id', form.id).select()
      : db().from('shipments').insert(payload).select()
    const { data, error } = await query
    setSaving(false)
    if (error) {
      if (error.code === '42501') {
        toast('Session expire ho gaya. Dobara login karein.', 'err')
        return expire()
      }
      return toast(error.message, 'err')
    }
    if (!data?.length) return toast('Save nahi hua. Dobara login karke try karein.', 'err')
    toast(form.id ? 'Parcel updated' : 'Parcel saved')
    setEditing(null)
    load()
  }

  async function remove(row) {
    if (!confirm(`${row.receiver_name} ka parcel delete karna hai?`)) return
    const { error } = await db().from('shipments').delete().eq('id', row.id)
    if (error) return toast(error.message, 'err')
    setSelected((s) => { const n = new Set(s); n.delete(row.id); return n })
    toast('Parcel deleted')
    load()
  }

  // Pehle dialog: 1 ya 4 labels per page
  function print(list) {
    if (!list.length) return
    setPrintAsk(list)
  }

  function startPrint(n) {
    setPerPage(n)
    setPrintRows(printAsk)
    setPrintAsk(null)
  }

  // Labels render hone ke baad print dialog kholo; print ke baad pending -> printed
  useEffect(() => {
    if (!printRows.length) return
    const after = async () => {
      const ids = printRows.filter((r) => r.status === 'pending').map((r) => r.id)
      setPrintRows([])
      if (ids.length) {
        await db().from('shipments').update({ status: 'printed' }).in('id', ids)
        load()
      }
    }
    window.addEventListener('afterprint', after, { once: true })
    const t = setTimeout(() => window.print(), 600) // barcode/QR render hone do
    return () => {
      clearTimeout(t)
      window.removeEventListener('afterprint', after)
    }
  }, [printRows, load])

  const selectedRows = rows.filter((r) => selected.has(r.id))
  const hasDate = Boolean(fromDate || toDate)

  function setToday() {
    const t = dayKey(new Date())
    setFromDate(t)
    setToDate(t)
  }

  // Export: rows select hain to wahi, warna jo list mein dikh rahe hain (date filter ke saath)
  const exportRows = selectedRows.length ? selectedRows : visible
  const rangeLabel = selectedRows.length
    ? `${selectedRows.length} selected`
    : fromDate && toDate && fromDate === toDate ? niceDate(fromDate)
    : hasDate ? `${fromDate ? niceDate(fromDate) : 'Shuru se'} – ${toDate ? niceDate(toDate) : 'Aaj tak'}`
    : 'Saari dates'
  const fileSuffix = hasDate
    ? `${fromDate || 'start'}_to_${toDate || dayKey(new Date())}`
    : dayKey(new Date())
  const counts = useMemo(() => {
    const c = { all: rows.length }
    STATUSES.forEach((s) => (c[s.value] = rows.filter((r) => r.status === s.value).length))
    return c
  }, [rows])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Parcels</h1>
          <p className="muted">{rows.length} parcels booked</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost btn-surface" onClick={() => setExporting(true)} disabled={!exportRows.length}>
            <IconDownload /> Export
          </button>
          <button className="btn btn-dark" onClick={() => print(selectedRows)} disabled={!selectedRows.length}>
            <IconPrint /> Print{selectedRows.length ? ` (${selectedRows.length})` : ''}
          </button>
          <button className="btn btn-primary" onClick={() => setEditing({})}>
            <IconPlus /> New parcel
          </button>
        </div>
      </header>

      <div className="toolbar">
        <label className="search">
          <IconSearch />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Naam, barcode, mobile, pincode…" aria-label="Search parcels" />
        </label>
        <div className="chips" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button key={f.value} role="tab" aria-selected={filter === f.value} className={`chip ${filter === f.value ? 'is-on' : ''}`} onClick={() => setFilter(f.value)}>
              {f.label} <span>{counts[f.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <button className="icon-btn" onClick={load} aria-label="Refresh"><IconRefresh /></button>
      </div>

      <div className="date-bar">
        <span className="date-bar-label"><IconCalendar /> Date</span>
        <label className="date-field">
          <span>From</span>
          <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="date-field">
          <span>To</span>
          <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <button className="chip" onClick={setToday}>Aaj</button>
        {hasDate && (
          <button className="link-btn" onClick={() => { setFromDate(''); setToDate('') }}>Clear</button>
        )}
        {hasDate && <span className="muted small date-count">{visible.length} parcels</span>}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th className="col-check">
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th>Receiver</th>
              <th>Barcode</th>
              <th>Pincode</th>
              <th>Mobile</th>
              <th className="t-right">COD</th>
              <th>Status</th>
              <th>Date</th>
              <th className="t-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="t-center muted pad">Loading parcels…</td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={9} className="t-center pad">
                <p className="muted">{rows.length ? 'Is search, filter ya date mein koi parcel nahi mila.' : 'Abhi koi parcel nahi hai. "New parcel" se shuru karein.'}</p>
              </td></tr>
            )}
            {!loading && visible.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? 'is-selected' : ''}>
                <td className="col-check">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.receiver_name}`} />
                </td>
                <td data-label="Receiver" className="cell-main">
                  <b>{r.receiver_name}</b>
                  <span className="muted small">{[r.district, r.state].filter(Boolean).join(', ')}</span>
                </td>
                <td data-label="Barcode" className="num">{r.barcode_no || '—'}</td>
                <td data-label="Pincode" className="num">{r.pincode || '—'}</td>
                <td data-label="Mobile" className="num">{r.mobile_no || '—'}</td>
                <td data-label="COD" className="num t-right">{r.cod_amount != null ? formatINR(r.cod_amount) : '—'}</td>
                <td data-label="Status"><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                <td data-label="Date" className="small">{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                <td className="t-right cell-actions">
                  <button className="icon-btn" onClick={() => setPreview(r)} aria-label="Preview label" title="Preview"><IconEye /></button>
                  <button className="icon-btn" onClick={() => print([r])} aria-label="Print label" title="Print"><IconPrint /></button>
                  <button className="icon-btn" onClick={() => setEditing(r)} aria-label="Edit" title="Edit"><IconEdit /></button>
                  <button className="icon-btn danger" onClick={() => remove(r)} aria-label="Delete" title="Delete"><IconTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRows.length > 0 && (
        <div className="selection-bar">
          <span>{selectedRows.length} selected</span>
          <button className="link-btn on-dark" onClick={() => setSelected(new Set())}>Clear</button>
          <button className="btn btn-yellow" onClick={() => print(selectedRows)}><IconPrint /> Print labels</button>
        </div>
      )}

      {editing && (
        <ShipmentForm initial={editing.id ? editing : null} saving={saving} onSave={save} onClose={() => setEditing(null)} />
      )}

      {preview && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div className="modal modal-preview">
            <header className="modal-head">
              <div><h2>Label preview</h2><p>Print mein aisa dikhega.</p></div>
              <button className="icon-btn" onClick={() => setPreview(null)} aria-label="Close"><IconClose /></button>
            </header>
            <div className="modal-body preview-body">
              <div className="preview-paper"><Label s={preview} /></div>
            </div>
            <footer className="modal-foot">
              <button className="btn btn-ghost" onClick={() => { setEditing(preview); setPreview(null) }}>Edit</button>
              <button className="btn btn-primary" onClick={() => { print([preview]); setPreview(null) }}><IconPrint /> Print</button>
            </footer>
          </div>
        </div>
      )}

      {exporting && (
        <ExportDialog
          rows={exportRows}
          rangeLabel={rangeLabel}
          fileSuffix={fileSuffix}
          onClose={() => setExporting(false)}
          onDone={(n) => { setExporting(false); toast(`${n} parcels export ho gaye`) }}
        />
      )}

      {printAsk && (
        <PrintDialog count={printAsk.length} onPrint={startPrint} onClose={() => setPrintAsk(null)} />
      )}

      <PrintLabels rows={printRows} perPage={perPage} />
    </div>
  )
}
