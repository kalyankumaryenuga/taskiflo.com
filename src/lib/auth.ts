import { isSupabaseConfigured, supabase } from './supabase'

export type AuthMode = 'login' | 'signup'

export type AuthResult = {
  email: string
  mode: 'demo' | 'supabase'
  message: string
}

export async function getCurrentAuthEmail() {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return null
  }

  return data.session?.user.email ?? null
}

export async function authenticate(email: string, password: string, mode: AuthMode): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      email,
      mode: 'demo',
      message: 'Demo session started. Add Supabase env keys to enable real auth.',
    }
  }

  const response =
    mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

  if (response.error) {
    throw new Error(response.error.message)
  }

  return {
    email: response.data.user?.email ?? email,
    mode: 'supabase',
    message: mode === 'signup' ? 'Account created. Check email confirmation settings if login is blocked.' : 'Signed in with Supabase.',
  }
}

export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut()
  }
}
