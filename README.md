# Queen-Spa — Day Spa & Wellness Website

A calm, elegant marketing website for **Queen-Spa**, a Cape Town day spa.
Built with vanilla HTML, CSS, and JavaScript — no build tools required.

This README documents **two versions** of the project:

- **v0 — Original (inline CSS):** styling written directly inside each HTML file
  using `style=""` attributes and `<table>` layouts. No shared stylesheet.
- **v1 — Refactored (current):** external `css_assets/style.css`, CSS custom
  properties, semantic HTML, Grid/Flexbox layout, one unified JS file.


## 🕓 Version History

| Version | Description |
|---|---|
| **v0 — Original (inline CSS)** | Every page styled itself with inline `style=""` attributes and `<table>` layouts. Only `index.html` linked an external `myfirststyles.css` and had a `<style>` block. Two JS files (`main.js` + `javascript.js`). Placeholder contact info (`hello@dorendecorco.com`, `+1 (234) 567-890`). |
| **v1 — Refactored (current)** | External `css_assets/style.css`, CSS custom properties in `:root`, Grid/Flexbox layout, one unified `javascript/javascript.js`, mobile hamburger nav, accessibility fixes, real Cape Town contact info (`hello@queen-spa.co.za`, `+27 (0)21 555 0142`). |

---

## ✨ Features

- **Fully responsive** — mobile-first breakpoints at 480 / 768 / 860 / 1024 px (v1)
- **5 pages** — Home, About, Services, Gallery, Contact
- **Lightbox gallery** — powered by [Lightbox2](https://lokeshdhakar.com/projects/lightbox2/)
- **Interactive details** — cursor-following glow, tilt-on-hover cards, reveal-on-scroll
- **Animated stat counters** — `150+`, `12`, `100%`, `24/7`
- **Service filter chips** — filter by Body / Face / Wellness
- **Accessible** — skip link, keyboard focus outlines, ARIA labels, `prefers-reduced-motion` support
- **Contact form** — client-side validation + `mailto:` fallback (no backend needed)
- **Sticky header** — with mobile hamburger menu and mobile CTA bar
- **Floating "Book a Treatment" button** on desktop
- **Auto-updating footer year**

---

## 📁 Project Structure

### v1 — Refactored (current)
