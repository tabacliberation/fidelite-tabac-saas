export interface Shop {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  hours: Record<string, string> | null
  hero_image: string | null
  logo_url: string | null
  admin_email: string
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled'
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface Profile {
  id: string
  shop_id: string
  first_name: string
  last_name: string
  phone: string
  birth_date: string | null
  push_subscription: PushSubscriptionJSON | null
  pin_attempts: number
  pin_locked: boolean
  created_at: string
}

export interface Offer {
  id: string
  shop_id: string
  title: string
  description: string | null
  required_points: number
  reward: string | null
  icon: string
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface SimpleOffer {
  id: string
  shop_id: string
  title: string
  description: string | null
  reward: string | null
  icon: string
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface LoyaltyCard {
  id: string
  shop_id: string
  profile_id: string
  offer_id: string
  current_points: number
  completed_count: number
  last_updated: string
  offer?: Offer
}

export interface AdminSettings {
  id: string
  shop_id: string
  pin_code: string
  shop_name: string
  updated_at: string
}

export interface WheelWin {
  id: string
  shop_id: string
  profile_id: string | null
  prize: string
  won_at: string
  collected: boolean
  profiles?: Pick<Profile, 'first_name' | 'last_name' | 'phone'>
}

export interface ClientNotification {
  id: string
  shop_id: string
  profile_id: string
  title: string
  body: string | null
  image: string | null
  url: string | null
  read: boolean
  created_at: string
}
