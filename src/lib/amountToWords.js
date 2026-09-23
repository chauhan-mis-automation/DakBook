const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}

function threeDigits(n) {
  const h = Math.floor(n / 100)
  const r = n % 100
  return [h ? ONES[h] + ' Hundred' : '', r ? twoDigits(r) : ''].filter(Boolean).join(' ')
}

// Indian numbering: 1800 -> "Rupees One Thousand Eight Hundred Only"
export function amountToWords(value) {
  const num = Number(value)
  if (!value || isNaN(num) || num <= 0) return ''
  let rupees = Math.floor(num)
  const paise = Math.round((num - rupees) * 100)

  const crore = Math.floor(rupees / 1e7); rupees %= 1e7
  const lakh = Math.floor(rupees / 1e5); rupees %= 1e5
  const thousand = Math.floor(rupees / 1000); rupees %= 1000

  const parts = []
  if (crore) parts.push(threeDigits(crore) + ' Crore')
  if (lakh) parts.push(twoDigits(lakh) + ' Lakh')
  if (thousand) parts.push(twoDigits(thousand) + ' Thousand')
  if (rupees) parts.push(threeDigits(rupees))

  let text = 'Rupees ' + (parts.join(' ') || 'Zero')
  if (paise) text += ' and ' + twoDigits(paise) + ' Paise'
  return text + ' Only'
}

export function formatINR(value) {
  const num = Number(value || 0)
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
