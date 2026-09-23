import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/supabase'
import { formatINR } from '../lib/amountToWords'
import { IconPlus, IconParcel } from '../components/Icons'
import { useAuth } from '../lib/auth'

function isToday(d) {
  const x = new Date(d), n = new Date()
  return x.toDateString() === n.toDateString()
}

export default function Dashboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data, error } = await db()
        .from('shipments')
        .select('id, created_at, receiver_name, barcode_no, district, state, cod_amount, status')
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      setRows(data || [])
      setLoading(false)
    })()
  }, [])

  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.status === 'pending')
    const notDispatched = rows.filter((r) => r.status !== 'dispatched')
    return {
      total: rows.length,
      today: rows.filter((r) => isToday(r.created_at)).length,
      pending: pending.length,
      printed: rows.filter((r) => r.status === 'printed').length,
      dispatched: rows.filter((r) => r.status === 'dispatched').length,
      codTotal: rows.reduce((a, r) => a + Number(r.cod_amount || 0), 0),
      codPending: notDispatched.reduce((a, r) => a + Number(r.cod_amount || 0), 0),
    }
  }, [rows])

  const topStates = useMemo(() => {
    const map = {}
    rows.forEach((r) => r.state && (map[r.state] = (map[r.state] || 0) + 1))
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [rows])

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{greet}, {user?.full_name || user?.username}</h1>
          <p className="muted">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/parcels?new=1" className="btn btn-primary">
          <IconPlus /> New parcel
        </Link>
      </header>

      {error && <p className="form-error">{error}</p>}

      <section className="ledger" aria-busy={loading}>
        <div className="ledger-main">
          <span className="ledger-label">COD value, pending dispatch</span>
          <span className="ledger-value">{loading ? '—' : formatINR(stats.codPending)}</span>
          <span className="muted small">Total COD booked: {loading ? '—' : formatINR(stats.codTotal)}</span>
        </div>
        <dl className="ledger-grid">
          <div><dt>Aaj ke parcels</dt><dd>{loading ? '—' : stats.today}</dd></div>
          <div><dt>Total parcels</dt><dd>{loading ? '—' : stats.total}</dd></div>
          <div><dt><i className="dot dot-pending" />Pending</dt><dd>{loading ? '—' : stats.pending}</dd></div>
          <div><dt><i className="dot dot-printed" />Printed</dt><dd>{loading ? '—' : stats.printed}</dd></div>
          <div><dt><i className="dot dot-dispatched" />Dispatched</dt><dd>{loading ? '—' : stats.dispatched}</dd></div>
        </dl>
      </section>

      <div className="dash-cols">
        <section className="panel">
          <header className="panel-head">
            <h2>Recent parcels</h2>
            <Link to="/parcels" className="link-btn">Sab dekho</Link>
          </header>
          {!loading && rows.length === 0 ? (
            <div className="empty">
              <IconParcel width={36} height={36} />
              <p>Abhi tak koi parcel nahi hai.</p>
              <Link to="/parcels?new=1" className="btn btn-primary">Pehla parcel add karein</Link>
            </div>
          ) : (
            <ul className="recent">
              {rows.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <div>
                    <b>{r.receiver_name}</b>
                    <span className="muted small">{[r.district, r.state].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                  <div className="recent-right">
                    <span className="num">{formatINR(r.cod_amount)}</span>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel-head"><h2>Top states</h2></header>
          {topStates.length === 0 ? (
            <p className="muted small pad">Parcels add hone ke baad yahan dikhega.</p>
          ) : (
            <ul className="bars">
              {topStates.map(([state, count]) => (
                <li key={state}>
                  <div className="bar-row"><span>{state}</span><span className="num">{count}</span></div>
                  <div className="bar"><span style={{ width: `${(count / topStates[0][1]) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
