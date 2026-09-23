import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
const SESSION_KEY = 'dakbook_session'

let client = null
let clientToken

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// Har request ke saath session token header mein jata hai.
// Database ka RLS policy isi token ko check karta hai.
export function db() {
  const token = getSession()?.token || null
  if (!client || clientToken !== token) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: token ? { 'x-session-token': token } : {} },
    })
    clientToken = token
  }
  return client
}
