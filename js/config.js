// ====================== YOUR SETTINGS ======================
// Edit these values, then upload the folder again.
export const CONFIG = {
  BRAND: 'Bubbly Invites',               // your business name (shown on pages)
  BUSINESS_WHATSAPP: '94770000000',    // your WhatsApp number for customers (country code, no +)

  // Free database for RSVP tracking (see README, step "Turn on RSVP tracking").
  // Leave empty to run without a database: links still work and replies arrive on WhatsApp.
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Admin PIN, used only while SUPABASE_URL is empty. Change it!
  ADMIN_PIN: '1234',

  // ---------------- PRICES (shown on your website and used for guest limits) ----------------
  // guests: how many personal invitation links the package allows (0 = unlimited)
  CURRENCY: '$',
  PLANS: [
    { id: 'free',      name: 'Free',      price: 0,  guests: 20,  tagline: 'Try it with close family',
      features: ['20 personal invitations', 'All 10 themes & 8 languages', 'Talking AR couple', 'Replies on WhatsApp'] },
    { id: 'basic',     name: 'Basic',     price: 5,  guests: 50,  tagline: 'Small & intimate weddings',
      features: ['50 personal invitations', 'Everything in Free', 'Guest names in AR', 'Countdown & map'] },
    { id: 'standard',  name: 'Standard',  price: 9,  guests: 150, tagline: 'Most couples choose this', popular: true,
      features: ['150 personal invitations', 'Everything in Basic', 'RSVP list & guest count', 'Skin tone choice'] },
    { id: 'premium',   name: 'Premium',   price: 15, guests: 300, tagline: 'Big family weddings',
      features: ['300 personal invitations', 'Everything in Standard', 'Priority WhatsApp support', 'Free text changes'] },
    { id: 'unlimited', name: 'Unlimited', price: 25, guests: 0,   tagline: 'No limits at all',
      features: ['Unlimited invitations', 'Everything in Premium', 'General link for groups', 'Our branding removed'] }
  ],
  ADDONS: [
    { name: 'Custom couple cartoon drawn from your photo', price: 12 },
    { name: 'Remove our branding (Free–Premium)', price: 3 },
    { name: 'Same-day delivery', price: 5 }
  ],
  PLANNER_PACK: { name: 'Wedding planner & printer pack', price: 79, text: '10 weddings, any package, your own branding. Resell at your own price.' }
};
