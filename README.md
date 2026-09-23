# DakBook — Parcel Desk (React + Supabase)

COD parcels ka record rakhne aur India Post label print karne ka CRM.

## Features
- Username/password login (apne `app_users` table se, Supabase Auth nahi)
- Dashboard: COD value, pending/printed/dispatched count, recent parcels, top states
- Parcels: form mein label ke saare fields, table, search, status filter
- Pincode daalte hi district/state/post office auto-fill (India Post API)
- COD amount se "In words" auto-fill
- Rows select karo, **Print** dabao: har parcel alag page pe label format mein print
- Print ke baad status apne aap `pending` se `printed` ho jata hai
- Mobile pe bottom navigation, table cards ban jaati hai, form full-screen

## Chalane ke steps

1. **Node.js 18+** install karein: https://nodejs.org
2. Supabase SQL Editor mein pichla SQL (users, sessions, login functions, shipments) run kar dein, aur ek user bana lein.
3. Is folder mein terminal kholein:
   ```bash
   npm install
   npm run dev
   ```
4. Browser mein `http://localhost:5173` kholein aur login karein.

`.env` file mein Supabase URL aur key already daali hui hai.

## Deploy (Vercel / Netlify)
```bash
npm run build
```
`dist` folder deploy karein. Vercel/Netlify pe Environment Variables mein
`VITE_SUPABASE_URL` aur `VITE_SUPABASE_KEY` bhi add kar dein.

## Print tips
- Chrome print dialog mein **Margins: Default**, **Scale: 100%** rakhein.
- "Headers and footers" ka tick hata dein, warna page pe URL/date aayega.

## Folder structure
```
src/
  lib/          supabase client, login, amount-to-words, field defaults
  components/   Layout (sidebar), ShipmentForm, PrintLabels, Postmark logo, Toast
  pages/        Login, Dashboard, Parcels
  styles.css    poora design + print layout
```
