// DakBook ka logo: ek post-office postmark (thappa)
export default function Postmark({ size = 48, light = false }) {
  const ring = light ? '#FFFFFF' : '#B4232C'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="DakBook postmark">
      <defs>
        <path id="pm-top" d="M 16 50 A 34 34 0 0 1 84 50" />
        <path id="pm-bottom" d="M 12 50 A 38 38 0 0 0 88 50" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="3" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={ring} strokeWidth="1.5" strokeDasharray="2.5 2.5" />
      <text fontSize="10.5" fontWeight="700" letterSpacing="2" fill={ring} fontFamily="Archivo, sans-serif">
        <textPath href="#pm-top" startOffset="50%" textAnchor="middle">DAKBOOK</textPath>
      </text>
      <text fontSize="8" fontWeight="600" letterSpacing="1.5" fill={ring} fontFamily="Archivo, sans-serif">
        <textPath href="#pm-bottom" startOffset="50%" textAnchor="middle">PARCEL DESK</textPath>
      </text>
      <rect x="37" y="41" width="26" height="18" rx="1.5" fill="none" stroke="#F2B21B" strokeWidth="3" />
      <path d="M37 42.5 L50 52 L63 42.5" fill="none" stroke="#F2B21B" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}
