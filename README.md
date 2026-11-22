# Bubbly Invites: AR wedding invitations (complete product)

Guests open a personal link. A cute cartoon couple appears **in their room with AR** and greets them by name:
"Dear Nimal, we are getting married!". Then the couple tells the date, the time and the venue in speech bubbles.
Guests reply (RSVP) inside the invitation.

## What's inside

| File | What it is |
|---|---|
| `index.html` | Your business website: shows the 5 templates and an "Order on WhatsApp" button |
| `admin.html` | **Admin panel**: create invitations, choose a template, add guests, send links, see replies |
| `i.html` | The invitation page guests open (envelope → AR couple → details → RSVP) |
| `js/config.js` | **Your settings**: business name, WhatsApp, admin PIN, database keys |
| `js/scene.js` | AR engine: builds the animated, talking couple from the invitation details |
| `js/scene3d.js` | Optional 3D look (first 5 themes) |
| `js/i18n.js` | The 8 languages |
| `js/templates.js` | **All 10 themes**: the original 2D drawings of every couple and backdrop |
| `supabase.sql` | Database setup for RSVP tracking (optional) |

**10 themes:** Kandyan Traditional · Classic White · Tamil Hindu · Muslim Elegance · Tropical Beach · Chinese Red · Indian Royal · Korean Hanbok · Rustic Garden · Royal Night Gala (dark).
**8 languages:** English, Sinhala, Tamil, Hindi, Chinese, Korean, Spanish, French. The AR speech bubbles and the whole guest page switch language.
**Look:** 2D cartoon (default). The first 5 themes also have an optional 3D figure look.

The couple blinks, nods, waves, hops and moves their mouths while they talk.

---

## 1. Put it online (free, 5 minutes)

1. Open `js/config.js` in Notepad. Change `BRAND`, `BUSINESS_WHATSAPP` and **`ADMIN_PIN`**, then save.
2. Go to **https://app.netlify.com/drop** and drag in this whole folder.
3. Netlify gives you a link like `https://your-name.netlify.app`.
   - Your shop: `https://your-name.netlify.app/`
   - Your admin: `https://your-name.netlify.app/admin.html`
4. Optional: in Netlify, rename the site, or connect your own domain (for example `arinvites.lk`).

To update later, drag the folder into Netlify again (Deploys → drag and drop).

## 2. Make an invitation

1. Open `admin.html` and enter your PIN.
2. Click **+ New invitation**. Choose the template, type the names, date, programme, venue,
   Google Maps link and the couple's WhatsApp number. The **live preview** shows the talking couple.
3. Click **Save**, then open **2. Guests & links**.
4. Paste the guest list, one per line, with a phone number after a comma (optional):
   ```
   Nimal Perera, 0771234567
   Kamala Aunty
   ```
5. For each guest, tap the green **WhatsApp** button. WhatsApp opens with the message and their
   personal link, ready to send. You can also copy the link, or share the **General link** in groups.

## 3. Two ways to run it

### A) Without a database (works right away)
- Everything works, and links carry the invitation details inside them.
- When a guest replies, WhatsApp opens with their answer, addressed to the couple.
- Your invitations are saved **in your browser only**. Use the **Backup** button often, and use the same browser.
- The PIN keeps casual visitors out, but it is not strong security. Use option B for a real business.

### B) With a free Supabase database (recommended for business)
You get short links, all replies collected in the admin panel ("12 people coming, 3 declined, opened or not"),
secure email login, and access from any device.

1. Create a free account at **https://supabase.com**, then click **New project**.
2. Open **SQL Editor → New query**, paste everything from `supabase.sql`, and click **Run**.
3. Go to **Authentication → Users → Add user** and create your admin email and password.
   Then in **Authentication → Sign In / Providers**, turn **off** "Allow new users to sign up".
4. In **Project Settings → API**, copy the **Project URL** and the **anon public key** into `js/config.js`:
   ```js
   SUPABASE_URL: 'https://xxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJhbGciOi...',
   ```
5. Upload the folder to Netlify again. The admin now asks for email and password.

Note: invitations made in mode A stay in your browser. Create them again after switching to B.

## 4. Your own couple art (premium add-on)
In the admin panel, under **Couple**, choose **My own couple art**. Then add a groom image and a bride image,
or one image with both of them in the groom box. Use a transparent PNG, SVG or WebP, standing full body,
about 1000 px tall, under 3 MB. The couple then hops, sways and "talks" in AR with the speech bubbles,
using the colours of the theme you picked.
- **Without Supabase:** press Upload. The file is saved to your Downloads with a new name.
  Put it in the site's `custom` folder and upload the site to Netlify again. Two examples are included:
  `custom/example-groom.png` and `custom/example-bride.png`.
- **With Supabase:** Upload stores it online automatically.

The drawn couples also have a **skin tone** choice (Light, Medium, Tan, Deep) for the groom and the bride.

## 5. Prices & packages
Your prices are in `js/config.js` (`PLANS`, `ADDONS`, `PLANNER_PACK`). Change the numbers, names or features
and the website updates by itself. Each invitation has a **Package** setting in the admin panel, and the guest list
stops at that package's number of invitations (for example 50 for Basic).
Suggested plan: Free 20 · Basic $5 for 50 · Standard $9 for 150 · Premium $15 for 300 · Unlimited $25.
Add-ons: custom cartoon $12 · remove branding $3 · same-day $5. Planner pack: 10 weddings for $79.

## 6. AR on phones
| Phone | What happens |
|---|---|
| Android (Chrome, ARCore phones) | Full AR: the couple stands on the floor or table, talks and moves |
| iPhone (Safari) | Opens Apple AR (Quick Look). The couple appears **standing still, without animation**, with the date bubble showing |
| Laptop | Animated 3D preview, with a note to open the link on a phone |

Tell guests to open links in **Chrome or Safari**. Instagram's and Facebook's in-app browsers can block AR.

## 7. Your brand & Google (SEO)
The brand **Bubbly Invites** is set in `js/config.js` (`BRAND`), with the logo in `img/logo.svg`, `favicon.svg`
and `apple-touch-icon.png`. The share pictures that WhatsApp and Facebook show are `img/og-image.jpg` (website)
and `img/og-invite.jpg` (invitations).

The website is ready for search engines:
- A title, description and keywords for searches like "AR wedding invitation", "digital wedding invitation",
  "WhatsApp wedding invitation", "online RSVP" and "Indian/Chinese/Sri Lankan wedding invitation"
- Headings and text that use those words naturally, plus a features section and an FAQ section
- Structured data (business, prices and FAQ) so Google can show rich results
- `sitemap.xml` and `robots.txt`. Admin and guest invitation pages are hidden from Google (private)
- Fast loading: fonts and libraries are cached (`_headers` file for Netlify)

**Important: when you have your domain**, find `www.bubblyinvites.com` and replace it with your real domain in these
4 files: `index.html`, `i.html`, `robots.txt`, `sitemap.xml`. Then:
1. Add the site to **Google Search Console** (search.google.com/search-console) and submit `sitemap.xml`.
2. Create a free **Google Business Profile** named Bubbly Invites.
3. Post invitation videos on Instagram, TikTok and Facebook with a link to your site. Links from other sites help ranking.

Check that the name and domain are free before you buy (domain sellers, WIPO Global Brand Database).

## 8. Selling tips
- Let couples try the **Free** package (20 invitations) first. When parents want to invite everyone, they upgrade.
- Wedding planners, photographers and card printers can resell your invitations with the **planner pack**.
- Make a free preview with the customer's names in 2 minutes. It sells itself.
- Every guest page says "Made with ♥ by [your brand]" with your WhatsApp link: free marketing at every wedding.

## Need changes?
New templates, a cartoon drawn from the couple's photo, music or voice can all be added.
