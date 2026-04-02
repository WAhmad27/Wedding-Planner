import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Returns the wedding for the current user —
 * either one they own or one they're a collaborator on.
 */
export async function getWeddingForUser(supabase: SupabaseClient, userId: string) {
  // Check owned wedding first
  const { data: owned } = await supabase
    .from('weddings')
    .select('*')
    .eq('owner_id', userId)
    .single()

  if (owned) return owned

  // Check collaborator wedding
  const { data: collab } = await supabase
    .from('collaborators')
    .select('wedding_id')
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .single()

  if (!collab) return null

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', collab.wedding_id)
    .single()

  return wedding ?? null
}
