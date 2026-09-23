import { useEffect, useState } from 'react'
import { EMPTY_SHIPMENT, INDIAN_STATES, STATUSES } from '../lib/fields'
import { amountToWords } from '../lib/amountToWords'
import { IconClose } from './Icons'

function Field({ label, name, value, onChange, required, type = 'text', span, hint, ...rest }) {
  return (
    <label className={`field ${span ? 'span-' + span : ''}`}>
      <span className="field-label">
        {label} {required && <em aria-hidden="true">*</em>}
      </span>
      {type === 'textarea' ? (
        <textarea name={name} value={value ?? ''} onChange={onChange} required={required} rows={3} {...rest} />
      ) : (
        <input name={name} type={type} value={value ?? ''} onChange={onChange} required={required} {...rest} />
      )}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  )
}

export default function ShipmentForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_SHIPMENT, ...(initial || {}) }))
  const [wordsTouched, setWordsTouched] = useState(false)
  const [postOffices, setPostOffices] = useState([])
  const [pinStatus, setPinStatus] = useState('')
  const [senderOpen, setSenderOpen] = useState(false)
  const isEdit = Boolean(initial?.id)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function update(e) {
    const { name, value } = e.target
    setForm((f) => {
      const next = { ...f, [name]: value }
      if (name === 'cod_amount' && !wordsTouched) next.amount_in_words = amountToWords(value)
      return next
    })
    if (name === 'amount_in_words') setWordsTouched(true)
    if (name === 'pincode' && /^\d{6}$/.test(value)) lookupPincode(value)
  }

  // India Post ki public API se pincode ke hisaab se district/state/post office bharo
  async function lookupPincode(pin) {
    setPinStatus('Pincode check ho raha hai…')
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const json = await res.json()
      const offices = json?.[0]?.PostOffice || []
      if (!offices.length) {
        setPinStatus('Is pincode ki details nahi mili. Khud bhar dein.')
        setPostOffices([])
        return
      }
      setPostOffices(offices.map((o) => o.Name))
      const o = offices[0]
      setForm((f) => ({
        ...f,
        district: f.district || o.District || '',
        state: f.state || o.State || '',
        tehsil: f.tehsil || o.Block || '',
        post: f.post || (offices.length === 1 ? o.Name : ''),
      }))
      setPinStatus(`${offices.length} post office mile. Post field mein se chunein.`)
    } catch {
      setPinStatus('Pincode lookup nahi ho paya. Khud bhar dein.')
    }
  }

  function resetWords() {
    setWordsTouched(false)
    setForm((f) => ({ ...f, amount_in_words: amountToWords(f.cod_amount) }))
  }

  function submit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} aria-labelledby="form-title">
        <header className="modal-head">
          <div>
            <h2 id="form-title">{isEdit ? 'Edit parcel' : 'New parcel'}</h2>
            <p>Jo fields label pe print hote hain, sab yahan hain.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </header>

        <div className="modal-body">
          <fieldset className="section">
            <legend>Receiver</legend>
            <div className="grid">
              <Field label="Receiver name" name="receiver_name" value={form.receiver_name} onChange={update} required span={2} autoFocus placeholder="Tuhin Kumar" />
              <Field label="C/O" name="care_of" value={form.care_of} onChange={update} span={2} placeholder="C/O Tuhin Kumar" />
              <Field label="Full address" name="address" type="textarea" value={form.address} onChange={update} span={4} placeholder="House no, area, city" />
              <Field label="Near by landmark" name="near_by_landmark" value={form.near_by_landmark} onChange={update} span={2} />
              <Field label="Pincode" name="pincode" value={form.pincode} onChange={update} inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="700105" hint={pinStatus} />
              <label className="field">
                <span className="field-label">Post</span>
                <input name="post" list="post-offices" value={form.post} onChange={update} />
                <datalist id="post-offices">
                  {postOffices.map((p) => <option key={p} value={p} />)}
                </datalist>
              </label>
              <Field label="Tehsil" name="tehsil" value={form.tehsil} onChange={update} />
              <Field label="District" name="district" value={form.district} onChange={update} />
              <label className="field span-2">
                <span className="field-label">State</span>
                <input name="state" list="states" value={form.state} onChange={update} />
                <datalist id="states">
                  {INDIAN_STATES.map((s) => <option key={s} value={s} />)}
                </datalist>
              </label>
              <Field label="Mobile no." name="mobile_no" type="tel" value={form.mobile_no} onChange={update} inputMode="numeric" pattern="\d{10}" maxLength={10} span={2} placeholder="10 digit" />
              <Field label="Alternate number" name="alternate_number" type="tel" value={form.alternate_number} onChange={update} inputMode="numeric" maxLength={10} span={2} />
            </div>
          </fieldset>

          <fieldset className="section">
            <legend>Parcel</legend>
            <div className="grid">
              <Field label="Barcode / article no." name="barcode_no" value={form.barcode_no} onChange={(e) => update({ target: { name: 'barcode_no', value: e.target.value.toUpperCase() } })} span={2} placeholder="EZ145475494IN" />
              <Field label="Order ID" name="order_id" value={form.order_id} onChange={update} span={2} />
              <Field label="Biller ID" name="biller_id" value={form.biller_id} onChange={update} />
              <Field label="Non BNPL code" name="non_bnpl_code" value={form.non_bnpl_code} onChange={update} />
              <Field label="Weight" name="weight" value={form.weight} onChange={update} span={2} placeholder="540 gm" />
              <Field label="Medicine / contents" name="medicine" type="textarea" value={form.medicine} onChange={update} span={4} placeholder="Vrikshamla 60 Cap, Slim Tea 50gm" />
            </div>
          </fieldset>

          <fieldset className="section">
            <legend>Payment</legend>
            <div className="grid">
              <Field label="COD amount (₹)" name="cod_amount" type="number" min="0" step="0.01" value={form.cod_amount} onChange={update} placeholder="1800" />
              <label className="field span-3">
                <span className="field-label">
                  In words
                  {wordsTouched && (
                    <button type="button" className="link-btn" onClick={resetWords}>Auto bharo</button>
                  )}
                </span>
                <input name="amount_in_words" value={form.amount_in_words} onChange={update} />
              </label>
              {isEdit && (
                <label className="field span-2">
                  <span className="field-label">Status</span>
                  <select name="status" value={form.status} onChange={update}>
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>
              )}
            </div>
          </fieldset>

          <fieldset className="section">
            <legend>
              <button type="button" className="collapse-btn" onClick={() => setSenderOpen((o) => !o)} aria-expanded={senderOpen}>
                Sender (From) <span>{senderOpen ? 'Hide' : 'Change'}</span>
              </button>
            </legend>
            {!senderOpen ? (
              <p className="sender-preview">
                <b>{form.sender_name}</b><br />{form.sender_address}
                {form.sender_phone && <><br />{form.sender_phone}</>}
              </p>
            ) : (
              <div className="grid">
                <Field label="Sender name" name="sender_name" value={form.sender_name} onChange={update} span={4} />
                <Field label="Sender address" name="sender_address" type="textarea" value={form.sender_address} onChange={update} span={4} />
                <Field label="Sender phone" name="sender_phone" value={form.sender_phone} onChange={update} span={2} />
              </div>
            )}
          </fieldset>
        </div>

        <footer className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save parcel'}
          </button>
        </footer>
      </form>
    </div>
  )
}
