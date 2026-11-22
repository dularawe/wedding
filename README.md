# AR Wedding Invitation Kit (sample: Kasun & Nethmi)

A guest scans the QR code on the back of the card. A web page opens (no app needed).
They point the phone at the **front** of the card, and the couple's video plays on top of it,
with floating petals and buttons for Location, RSVP, WhatsApp, Sound and Replay.

## What's inside

| File | What it is |
|---|---|
| `index.html` | The AR page (camera + video on the card) |
| `invite.html` | The invitation website with countdown and RSVP (the RSVP button opens this) |
| `assets/targets.mind` | The "fingerprint" of the card front. The AR uses it to recognize the card |
| `assets/target-image.jpg` | The image that `targets.mind` was made from |
| `assets/video.mp4` | The video that plays on the card (sample; replace with the couple's) |
| `assets/lib/` | AR libraries (A-Frame + MindAR). Don't change these |
| `print/` | Print-ready card, 5 x 7 inch at 300 dpi (front, back and a 2-page PDF) |

## Try it in 5 minutes (free)

1. Go to **https://app.netlify.com/drop** and drag in this whole folder.
2. Netlify gives you a link like `https://something.netlify.app`. Open it on your phone.
   (Camera only works on **https** links, so opening the file directly on your phone won't work.)
3. Open `print/card-front-5x7.png` on your laptop screen, or print it.
4. On your phone tap **Start AR**, allow the camera and point it at the card.

## Making a card for a new customer

1. **Design the card front** in Canva (5 x 7 inch). Tips for good tracking:
   - Use lots of detail: patterns, flowers, text, different shapes. **Avoid big plain areas.**
   - Don't use a repeating pattern alone. Mix different elements.
   - Use high contrast and print on **matte** paper. Shiny paper reflects light and breaks tracking.
2. **Make the `.mind` file:** export the front as JPG (about 1000 px tall), then go to
   **https://hiukim.github.io/mind-ar-js-doc/tools/compile**. Upload it, click Start
   and download `targets.mind`. Replace `assets/targets.mind` with it.
   The compiler also shows feature points. More points means better tracking.
3. **Video:** replace `assets/video.mp4` with the couple's video, then:
   - Make it **portrait, 5:7 shape** (for example 720 x 1008) so it fits the card exactly.
   - Keep it **under 10 MB** and 15–40 seconds long (export at 720p in CapCut).
4. **Edit `index.html`:** find `CONFIG` near the bottom and change the names, date,
   Google Maps link and the couple's WhatsApp number.
5. **Edit `invite.html`:** change the names, date, events and venue
   (search for "Kasun", "Nethmi", "2027", "Grand Lotus").
6. **Upload** to Netlify (free). In Netlify you can rename the site, for example
   `kasun-nethmi.netlify.app`.
7. **QR code:** make a QR for that link (free at qr-code-generator.com or in Canva),
   and put it on the **back** of the card. Keep the QR at least 2.5 cm wide.
8. **Test before printing!** Print one copy, scan it with an Android phone and an iPhone,
   in normal room light.

## Notes

- Works in Chrome (Android) and Safari (iPhone). Instagram's and Facebook's in-app browsers
  sometimes block the camera. Tell guests to open the link in Chrome or Safari.
- The QR on the sample card points to `https://kasun-nethmi.netlify.app/`, which is only an
  example. Make a new QR for each real order.
- The RSVP form in `invite.html` is a demo. It saves on the guest's phone only. For real orders,
  connect it to a Google Form or Google Sheet, or use the WhatsApp button.
- If a guest has no card with them, "Watch the video" on the start screen plays it normally.
