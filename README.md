# Beef Hive Butchery — Web Application

A fast, lightweight, and accessible single-branch web application for **Beef Hive Butchery** (Ruiru, Kenya). Built with pure HTML5, CSS3, and ES6+ JavaScript — ready to deploy directly on GitHub Pages or any static web host.

---

## 📍 Business Details & Live Contact Info

- **WhatsApp & Phone Contact**: `0714 534 463` (International: `254714534463`)
- **TikTok Account**: [`@jm.kesh`](https://www.tiktok.com/@jm.kesh)
- **Physical Shop Location**: Near Rainbow Ruiru Resort, Ruiru Town, Kiambu County, Kenya
- **Wholesale Price Rate**: KSh 650 / kg for bulk meat orders (restaurants, choma spots, events)
- **Opening Hours**:
  - Monday – Saturday: 6:30 AM – 8:00 PM
  - Sunday: 7:00 AM – 5:00 PM

---

## 📁 File Structure
```
/
├── index.html           # Main HTML5 layout with top bar, gourmet header, hero slider & real photos
├── css/style.css        # Responsive stylesheet with custom properties & focus rings
├── js/script.js         # Dynamic catalog renderer, hero slider & WhatsApp message generator
├── data/products.json   # Product catalog with real photo paths and prices
├── README.md            # Documentation & setup guide
└── images/              # Client real product photos, logo & hero slides
```

---

## 🚀 How to Run Locally

Since catalog products are loaded dynamically via `fetch('data/products.json')`, the site must be served over an HTTP server (not directly double-clicked via `file://`).

### Option 1: Python HTTP Server (Built-in)
Run in PowerShell / Terminal:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### Option 2: Node / `npx serve`
Run in PowerShell / Terminal:
```bash
npx serve .
```
Then open the provided local URL (e.g., `http://localhost:3000`).

---

## 🎨 Tech Stack & Design System
- **Technologies**: Vanilla HTML5, CSS3, JavaScript (ES6+). Zero build step, zero dependencies.
- **Color Palette**:
  - Kraft Paper Cream Background: `#EFE4CC`
  - Cream Card Background: `#FAF4E4`
  - Primary Accent (Oxblood Red): `#7A2426`
  - Charcoal Ink Text: `#2B2622`
  - Brass Gold Prices: `#B8862B`
- **Typography**: Google Fonts (*Big Shoulders Display* & *Work Sans*).
- **Accessibility**: Keyboard focus rings, ARIA tabs for catalog filtering, semantic HTML, and `prefers-reduced-motion` support.

---

## 👨‍💻 Credits
Built by **Denkaai** for Beef Hive Butchery (Ruiru, Kenya).
