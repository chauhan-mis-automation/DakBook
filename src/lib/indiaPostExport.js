import XLSX from 'xlsx-js-style'

/* =========================================================
   India Post bulk booking export
   Client ke Excel format ke hisaab se. Saari 4 sheets yahin code
   mein banti hain, kisi template file ki zarurat nahi.
   Jo values har parcel mein same rehti hain, wo EXPORT_CONFIG mein hain.
   ========================================================= */
export const EXPORT_CONFIG = {
  // Parcel defaults
  shape: 'NROL',            // ROLL / NROL / DOC
  length: 10,
  breadth: 5,
  height: 5,
  priorityFlag: true,
  deliveryInstruction: 'ND', // ND = Normal Delivery, OD = Open Delivery
  instructionRts: 'RTS',     // RTS = Returned to Sender
  ack: false,
  registration: true,
  otpBasedDelivery: true,
  defaultWeightGrams: 500,   // agar parcel mein weight nahi bhara ho

  // Sender (aapka office)
  senderAddLine1: 'NEAR MAHAKAL PARKING',
  senderAddLine2: 'NANGLOI',
  senderCity: 'Delhi',
  senderState: 'Delhi',
  senderPincode: 110041,
  senderEmail: 'divyajiwansansthan@gmail.com',
  senderAltContact: 9999873485,
  senderMobile: 9999873485,
  dropOffPincode: 110041,
}

export const HEADERS = [
  'SERIAL NUMBER', 'BARCODE NO', 'PHYSICAL WEIGHT', 'SHAPE OF ARTICLE', 'LENGTH ', 'BREADTH/DIAMETER', 'HEIGHT',
  'PRIORITY FLAG', 'DELIVERY INSTRUCTION', 'INSTRUCTION RTS', 'SENDER NAME', 'SENDER COMPANY', 'SENDER ADD LINE 1',
  'SENDER ADD LINE 2', 'SENDER CITY', 'SENDER STATE', 'SENDER PINCODE', 'SENDER EMAILID', 'SENDER ALT CONTACT',
  'SENDER KYC', 'SENDER TAX REFERENCE', 'RECEIVER NAME', 'RECEIVER COMPANY', 'RECEIVER ADD LINE 1',
  'RECEIVER ADD LINE 2', 'RECEIVER CITY', 'RECEIVER STATE', 'RECEIVER PINCODE', 'RECEIVER EMAILID',
  'RECEIVER ALT CONTACT', 'RECEIVER KYC', 'RECEIVER TAX REFERENCE', 'ALT ADDRESS FLAG', 'PICKUP ADDRESS FLAG',
  'DROP OFF PINCODE', 'DROPOFF/PICKUP OFFICE ID', 'SENDER MOBILE NO', 'RECEIVER MOBILE NO', 'PREPAYMENT CODE',
  'VALUE OF PREPAYMENT', 'CODR/COD', 'VALUE FOR CODR/COD', 'INSURANCE TYPE', 'VALUE OF INSURANCE', 'ACK',
  'REGISTRATION', 'OTP BASED DELIVERY', 'BULK REFERENCE',
]

const PICKUP_HEADERS = [
  'serial_no', 'addressee_name', 'company_name', 'address_line1', 'address_line2', 'address_line3', 'city',
  'state', 'pincode', 'email_id', 'alt_contact_no', 'mobile_no', 'pickup_schedule_slot', 'pickup_schedule_date',
]

const ALT_HEADERS = [
  'SERIAL NO', 'ADDRESSEE NAME', 'COMPANY NAME', 'ADDRESS LINE 1', 'ADDRESS LINE 2', 'ADDRESS LINE 3', 'CITY',
  'STATE', 'PINCODE', 'EMAIL ID', 'ALT CONTACT NO', 'MOBILE NO',
]

// Client ki file ki "Information" sheet, jaisi thi waisi
const INFO_ROWS = [
  ['SHAPE OF ARTICLE', null, 'PRIORITY FLAG', 'DELIVERY INSTRUCTION', null, null, 'INSTRUCTION RTS', null, 'CODR/COD', null, 'INSURANCE TYPE', 'PREPAYMENT', null, 'PICKUP SCHEDULE SLOT'],
  ['Code', 'Description', true, 'Code', 'Description', null, 'Code', 'Description', 'Code', 'Description', 'DOP', 'Code', 'Description', '10:00-13:00'],
  ['ROLL', 'Roll form', false, 'ND', 'Normal Delivery', null, 'RTS', 'Returned to Sender', 'codr', 'Cash On Delivery Retail(VP)', null, 'PS', 'Postage Stamps', '13:00-16:00'],
  ['NROL', 'Non Roll Form', null, 'OD', 'Open Delivery', null, 'RTA', 'Returned to Alternate Address', 'cod', 'Cash on Delivery', null, 'FM', 'Franking Machine'],
  ['DOC', 'Document', null, null, null, null, null, null, null, null, null, 'SS', 'Service Stamps'],
  [],
  [null, 'BOOLEAN(TRUE or FALSE)'],
  [null, 'PRIORITY FLAG'],
  [null, 'ALT ADDRESS FLAG'],
  [null, 'PICKUP ADDRESS FLAG'],
  [null, 'ACK'],
  [null, 'OTP BASED DELIVERY'],
  [null, 'REGISTRATION'],
  ['INSTRUCTIONS'],
  [1, 'If ALT ADDRESS FLAG is True, provide the address details in the AltAddress tab'],
  [2, 'If PICK UP ADDRESS FLAG is True, provide the pickup details in the PickupAddress tab'],
  [3, 'IF PICK UP ADDRESS FLAG is False,DropOff Pincode is mandatory in ArticleDetails tab'],
  [3, 'Do not change the field names or their positions in the first row'],
  [4, 'Please provide absolute values for physical weight, insurance amount, cod amount etc. Decimal values are not permitted'],
  [5, 'Date format should be in DD-MM-YYYY and format in date'],
  [6, 'Please use the specified codes as mentioned'],
]
const INFO_MERGES = ['A1:B1', 'D1:E1', 'G1:H1', 'I1:J1', 'L1:M1', 'A14:F14', 'B15:F15', 'B18:F18', 'B19:F19', 'B21:F21']

// "540 gm" -> 540, "1.2 kg" -> 1200, "540" -> 540
export function weightToGrams(text) {
  if (!text) return null
  const t = String(text).toLowerCase().replace(/,/g, '')
  const n = parseFloat(t.match(/[\d.]+/)?.[0])
  if (isNaN(n)) return null
  return Math.round(/kg|kilo/.test(t) ? n * 1000 : n)
}

const num = (x) => {
  const d = String(x ?? '').replace(/\D/g, '')
  return d ? Number(d) : ''
}
const txt = (x) => (x == null ? '' : String(x).trim())

export function toRow(s, i) {
  const c = EXPORT_CONFIG
  const cod = Number(s.cod_amount || 0)
  const addLine2 = [s.near_by_landmark, s.post].filter(Boolean).join(', ')
  return [
    i + 1,                                           // SERIAL NUMBER
    txt(s.barcode_no),                               // BARCODE NO
    weightToGrams(s.weight) ?? c.defaultWeightGrams, // PHYSICAL WEIGHT (grams)
    c.shape, c.length, c.breadth, c.height,
    c.priorityFlag, c.deliveryInstruction, c.instructionRts,
    txt(s.sender_name), txt(s.sender_name),          // SENDER NAME, COMPANY
    c.senderAddLine1, c.senderAddLine2, c.senderCity, c.senderState, c.senderPincode,
    c.senderEmail, c.senderAltContact,
    '', '',                                          // SENDER KYC, TAX REF
    txt(s.receiver_name),                            // RECEIVER NAME
    txt(s.receiver_name),                            // RECEIVER COMPANY
    txt(s.address),                                  // RECEIVER ADD LINE 1
    addLine2,                                        // RECEIVER ADD LINE 2
    txt(s.district),                                 // RECEIVER CITY
    txt(s.state).toUpperCase(),                      // RECEIVER STATE
    num(s.pincode),                                  // RECEIVER PINCODE
    '',                                              // RECEIVER EMAILID
    num(s.alternate_number),                         // RECEIVER ALT CONTACT
    '', '',                                          // RECEIVER KYC, TAX REF
    false, false,                                    // ALT ADDRESS FLAG, PICKUP ADDRESS FLAG
    c.dropOffPincode, '',                            // DROP OFF PINCODE, OFFICE ID
    c.senderMobile,                                  // SENDER MOBILE NO
    num(s.mobile_no),                                // RECEIVER MOBILE NO
    '', '',                                          // PREPAYMENT CODE, VALUE
    cod > 0 ? 'COD' : '',                            // CODR/COD
    cod > 0 ? Math.round(cod) : '',                  // VALUE (decimal allowed nahi)
    '', '',                                          // INSURANCE
    c.ack, c.registration, c.otpBasedDelivery,
    num(s.order_id),                                 // BULK REFERENCE
  ]
}

/* ---------- Styling ---------- */
// ArticleDetails ke columns 4 group mein alag rang
const GROUPS = [
  { from: 0, to: 9, fill: '1D2B3A' },   // A–J   Parcel details (navy)
  { from: 10, to: 20, fill: 'B4232C' }, // K–U   Sender (red)
  { from: 21, to: 31, fill: '2E5A87' }, // V–AF  Receiver (blue)
  { from: 32, to: 47, fill: '2F7D4F' }, // AG–AV Delivery & payment (green)
]
const thin = { style: 'thin', color: { rgb: 'BFC5CC' } }
const border = { top: thin, bottom: thin, left: thin, right: thin }

const headerStyle = (fill) => ({
  font: { name: 'Arial', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
  fill: { patternType: 'solid', fgColor: { rgb: fill } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border,
})

function styleTable(ws, colCount, rowCount, fillForCol) {
  for (let c = 0; c < colCount; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c })
    if (ws[ref]) ws[ref].s = headerStyle(fillForCol(c))
  }
  for (let r = 1; r <= rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const ref = XLSX.utils.encode_cell({ r, c })
      if (!ws[ref]) ws[ref] = { t: 's', v: '' }
      const cell = ws[ref]
      // Bade numbers (mobile, pincode) ko 1E+10 ki jagah poora dikhao
      if (cell.t === 'n') cell.z = '0'
      cell.s = {
        font: { name: 'Arial', sz: 10 },
        alignment: { vertical: 'center', horizontal: cell.t === 's' ? 'left' : 'center' },
        border,
        ...(r % 2 === 0 ? { fill: { patternType: 'solid', fgColor: { rgb: 'F4F5F2' } } } : {}),
      }
    }
  }
}

// Har column ki width uske header/data ke hisaab se
function autoWidth(headers, data) {
  return headers.map((h, c) => {
    const longestWord = Math.max(...String(h).split(/[\s/]+/).map((w) => w.length))
    const dataLen = Math.max(0, ...data.map((row) => String(row[c] ?? '').length))
    return { wch: Math.min(Math.max(longestWord + 3, dataLen + 2, 12), 45) }
  })
}

function tableSheet(headers, data, fillForCol) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  styleTable(ws, headers.length, data.length, fillForCol)
  ws['!cols'] = autoWidth(headers, data)
  ws['!rows'] = [{ hpt: 32 }, ...data.map(() => ({ hpt: 20 }))]
  return ws
}

function infoSheet() {
  const ws = XLSX.utils.aoa_to_sheet(INFO_ROWS)
  ws['!merges'] = INFO_MERGES.map((r) => XLSX.utils.decode_range(r))
  ws['!cols'] = [8, 24, 15, 10, 18, 4, 10, 28, 10, 26, 15, 10, 18, 22].map((wch) => ({ wch }))
  const bold = { font: { name: 'Arial', sz: 10, bold: true } }
  Object.keys(ws).forEach((ref) => {
    if (ref[0] === '!') return
    const { r } = XLSX.utils.decode_cell(ref)
    const isTitle = r === 0 || r === 13
    ws[ref].s = isTitle
      ? headerStyle('1D2B3A')
      : r === 1 || r === 6 ? bold : { font: { name: 'Arial', sz: 10 } }
  })
  return ws
}

/* ---------- Checks ---------- */
export function checkRows(rows) {
  const issues = []
  const count = (fn) => rows.filter(fn).length
  const noBarcode = count((r) => !r.barcode_no)
  const noPin = count((r) => !/^\d{6}$/.test(r.pincode || ''))
  const noMobile = count((r) => !/^\d{10}$/.test(r.mobile_no || ''))
  const noWeight = count((r) => weightToGrams(r.weight) == null)
  const decimalCod = count((r) => r.cod_amount && Number(r.cod_amount) % 1 !== 0)
  if (noBarcode) issues.push(`${noBarcode} parcel mein barcode no. nahi hai`)
  if (noPin) issues.push(`${noPin} parcel mein pincode galat ya khaali hai`)
  if (noMobile) issues.push(`${noMobile} parcel mein mobile no. 10 digit ka nahi hai`)
  if (noWeight) issues.push(`${noWeight} parcel mein weight nahi hai, ${EXPORT_CONFIG.defaultWeightGrams} gm maan liya jayega`)
  if (decimalCod) issues.push(`${decimalCod} parcel ka COD paise mein hai, poore rupaye mein round hoga`)
  return issues
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function buildWorkbook(rows) {
  const data = rows.map(toRow)
  const wb = XLSX.utils.book_new()
  const groupFill = (c) => GROUPS.find((g) => c >= g.from && c <= g.to).fill
  XLSX.utils.book_append_sheet(wb, tableSheet(HEADERS, data, groupFill), 'ArticleDetails')
  XLSX.utils.book_append_sheet(wb, tableSheet(PICKUP_HEADERS, [], () => '1D2B3A'), 'PickupAddress')
  XLSX.utils.book_append_sheet(wb, tableSheet(ALT_HEADERS, [], () => '1D2B3A'), 'AltAddress')
  XLSX.utils.book_append_sheet(wb, infoSheet(), 'Information')
  return { wb, data }
}

export async function exportIndiaPost(rows, { format = 'xlsx', filename = 'IndiaPost_Booking' } = {}) {
  const { wb, data } = buildWorkbook(rows)

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet([HEADERS, ...data]))
    download(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`)
    return
  }

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true })
  download(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${filename}.xlsx`
  )
}