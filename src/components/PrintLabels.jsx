import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import JsBarcode from 'jsbarcode'
import { formatINR } from '../lib/amountToWords'

function Barcode({ value, compact }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!value || !ref.current) return
    try {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        width: compact ? 1.4 : 1.6,
        height: compact ? 44 : 72,
        fontSize: compact ? 10 : 13,
        font: 'Arial', margin: 0, textMargin: 2,
      })
    } catch {
      /* galat barcode value ho to chhod do */
    }
  }, [value, compact])
  if (!value) return <div className="lbl-barcode-empty" />
  return <svg ref={ref} className="lbl-barcode" />
}

const v = (x) => x || ''

export function Label({ s, compact = false }) {
  const toCell = (
    <td colSpan={2} rowSpan={compact ? 2 : 3} className="lbl-to">
      <span className="lbl-k">To,</span>
      <div className="lbl-name">{v(s.receiver_name)}</div>
      {s.care_of && <div>{s.care_of}</div>}
      <div>{v(s.address)}</div>
    </td>
  )

  return (
    <article className={`lbl ${compact ? 'lbl-compact' : ''}`}>
      <table>
        <colgroup>
          {/* Bade label mein right side patla, taaki logo ka box square jaisa rahe */}
          <col style={{ width: '19%' }} />
          <col style={{ width: compact ? '41%' : '49%' }} />
          <col style={{ width: compact ? '13%' : '11%' }} />
          <col style={{ width: compact ? '27%' : '21%' }} />
        </colgroup>
        <tbody>
          <tr>
            {toCell}
            <th>BILLER ID</th>
            <td>{v(s.biller_id)}</td>
          </tr>
          <tr>
            <th>NON BNPL CODE</th>
            <td>{v(s.non_bnpl_code)}</td>
          </tr>
          {/* Chhote label mein barcode poori width leta hai, taaki scan ho sake */}
          <tr>
            <td colSpan={compact ? 4 : 2} className="lbl-code"><Barcode value={s.barcode_no} compact={compact} /></td>
          </tr>
          <tr>
            <th>NEAR BY LANDMARK</th><td>{v(s.near_by_landmark)}</td>
            <th>ORDER ID</th><td>{v(s.order_id)}</td>
          </tr>
          <tr>
            <th>POST</th><td>{v(s.post)}</td>
            <th>WEIGHT</th><td className="lbl-big">{v(s.weight)}</td>
          </tr>
          <tr>
            <th>TEHSIL</th><td>{v(s.tehsil)}</td>
            <th rowSpan={3}>MEDICINE</th><td rowSpan={3} className="lbl-med">{v(s.medicine)}</td>
          </tr>
          <tr><th>DISTRICT</th><td>{v(s.district)}</td></tr>
          <tr><th>STATE</th><td>{v(s.state)}</td></tr>
          <tr>
            <th>PINCODE</th><td className="lbl-strong">{v(s.pincode)}</td>
            {/* Logo: chhote label mein pincode se in words tak, bade mein label ke end tak */}
            <td colSpan={2} rowSpan={compact ? 5 : 7} className="lbl-logo-cell">
              <img src="/logo.png" alt="Jeewan Jyoti Ayurvedic Sansthan" className="lbl-logo" />
            </td>
          </tr>
          <tr><th>MOBILE NO.</th><td className="lbl-strong">{v(s.mobile_no)}</td></tr>
          <tr><th>ALTERNATE NUMBER</th><td>{v(s.alternate_number)}</td></tr>
          <tr>
            <th>COD AMOUNT</th>
            <td className="lbl-big">{s.cod_amount ? formatINR(s.cod_amount).replace('₹', 'Rs. ') : ''}</td>
          </tr>
          <tr>
            <th>IN WORDS</th>
            <td>{v(s.amount_in_words)}</td>
          </tr>
          {/* Chhote label mein From aur Declaration poori chaudai mein, taaki ek-do line mein aayein */}
          <tr>
            <td colSpan={compact ? 4 : 2} className="lbl-from">
              <span className="lbl-k">From:</span>
              <div className="lbl-name">{v(s.sender_name)}</div>
              <div>{v(s.sender_address)}</div>
              {s.sender_phone && <div>{s.sender_phone}</div>}
            </td>
          </tr>
          <tr>
            <td colSpan={compact ? 4 : 2} className="lbl-decl">
              <b>DECLARATION BY SENDER :-</b> I HEREBY CERTIFY THAT THIS ARTICLE DOES NOT CONTAIN ANY
              DANGEROUS OR PROHIBITED GOODS ACCORDING TO INDIAN POST RULE.
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  )
}

function chunk(list, size) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

// Ye sirf print ke time dikhta hai.
// perPage = 1 -> har label ek A4 page pe; perPage = 4 -> ek A4 pe 4 labels (2 x 2)
export default function PrintLabels({ rows, perPage = 1 }) {
  if (!rows.length) return null
  const four = perPage === 4
  return createPortal(
    <div className="print-root">
      {chunk(rows, four ? 4 : 1).map((group, i) => (
        <div key={i} className={`print-sheet ${four ? 'sheet-4' : 'sheet-1'}`}>
          {group.map((s) => (
            <div className="sheet-cell" key={s.id}>
              <Label s={s} compact={four} />
            </div>
          ))}
        </div>
      ))}
    </div>,
    document.body
  )
}