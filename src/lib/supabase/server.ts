import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(rememberMe = true) {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Without "keep me logged in", strip persistent expiry so the
              // cookie becomes a session cookie (cleared on browser close).
              const cookieOptions = rememberMe
                ? options
                : { ...options, maxAge: undefined, expires: undefined }
              cookieStore.set(name, value, cookieOptions)
            })
          } catch {
            // Server component — cookies can't be set
          }
        },
      },
    }
  )
}
