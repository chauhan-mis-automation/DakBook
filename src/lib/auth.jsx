import { createContext, useContext, useEffect, useState } from 'react'
import { db, getSession, saveSession, clearSession } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession())
  const [checking, setChecking] = useState(true)

  // App khulte hi check karo ki saved token abhi bhi valid hai
  useEffect(() => {
    ;(async () => {
      if (!getSession()) return setChecking(false)
      const { data, error } = await db().rpc('current_app_user_id')
      if (error || !data) {
        clearSession()
        setUser(null)
      }
      setChecking(false)
    })()
  }, [])

  async function login(username, password) {
    const { data, error } = await db().rpc('app_login', {
      p_username: username.trim(),
      p_password: password,
    })
    if (error) {
      if (error.message?.includes('Invalid')) throw new Error('Username ya password galat hai.')
      throw new Error(error.message || 'Login nahi ho paya. Internet check karein.')
    }
    saveSession(data)
    setUser(data)
  }

  async function logout() {
    const session = getSession()
    if (session?.token) {
      try {
        await db().rpc('app_logout', { p_token: session.token })
      } catch {
        // server pe logout fail ho tab bhi local se logout kar do
      }
    }
    clearSession()
    setUser(null)
  }

  // Token expire ho gaya ho to ye call karo
  function expire() {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, expire }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
