import { supabase } from './supabase'

export async function getShopBySlug(slug: string) {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getShopByHost(host: string) {
  // host = "monshop.fidelitetabac.fr" ou "monshop.localhost:3000"
  const slug = host.split('.')[0]
  return getShopBySlug(slug)
}
