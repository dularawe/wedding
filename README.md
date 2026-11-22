# AR Wedding Invitation: "Place Us Anywhere" (no printed card needed)

Guests open a link (sent on WhatsApp), tap **"See us in your room"** and point the phone at the
floor or a table. A cute animated bride and groom appear under a flower arch, with floating hearts,
twinkling sparkles and the couple's names on a banner. Guests can walk around, pinch to resize and
take photos with them.

## Files
| File | What it is |
|---|---|
| `index.html` | The invitation page with the 3D couple and the AR button |
| `invite.html` | The full invitation website with countdown and RSVP (the RSVP button opens it) |
| `assets/couple.glb` | The animated 3D scene (couple + arch + hearts + banner) |
| `assets/lib/model-viewer.min.js` | Google's free AR viewer. Don't change |
| `source/` | The picture parts used to build the 3D scene |

## Phone support
| Phone | What happens |
|---|---|
| Android (Chrome) | Full AR with animation, placed on the floor or table |
| iPhone (Safari) | Opens Apple's AR (Quick Look) and places the couple. It may show them **without the animation** |
| Laptop | Shows the animated 3D preview with the message "open on your phone" |

AR needs an **https** link. Opening the file directly won't start AR.

## Try it now (free)
1. Go to **https://app.netlify.com/drop** and drag in this folder.
2. Open the link on an Android phone in Chrome, tap **See us in your room** and point at the floor.

## For each new customer
1. **Couple picture:** get a cartoon of the couple with a plain white background, ideally made
   from their photo (many couples order a chibi cartoon). Make sure you have the right to use it.
2. **Rebuild the 3D scene:** send me the new picture plus the names and date, and I'll make a
   new `couple.glb` with the same animations. Or use a free tool like Blender for a fully custom one.
3. **Edit `index.html`:** change `CONFIG` near the bottom (names, wedding time, map link,
   WhatsApp number, calendar link) and the date/venue text in the page.
4. **Edit `invite.html`:** change the names, date, events and venue.
5. Upload to Netlify, rename the site (e.g. `kasun-nethmi.netlify.app`) and send the link on WhatsApp.

## Tips
- Tell guests to open the link in **Chrome or Safari**, not inside Instagram/Facebook.
- Works best in good light, on a floor or table with some texture (not a plain white or shiny surface).
- Guests can take a screenshot with the couple and share it. That's free marketing for you.
