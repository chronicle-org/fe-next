# 📘 [Chronicle](https://fe-next-theta.vercel.app/) — Web App (Next.js)

> **Share your stories, connect with minds.**  
Create, edit, and explore stories directly from the web — fast, responsive, and distraction-free.

Chronicle Web is the primary writing experience in the Chronicle ecosystem. It delivers a clean editor, smooth reading experience, and powerful account features — all built on modern web technology.

---

## 🚀 Features

- 📝 Rich text editor for writing stories
- 🔍 Discover and read posts from other authors
- 👤 Account & profile management
- 🌓 Light and dark mode
- ⚡ SEO-friendly static and dynamic pages
- 📱 Fully responsive — mobile, tablet, desktop

---

## 🧰 Tech Stack

- **Framework:** Next.js + TypeScript  
- **Styling:** Tailwind CSS  
- **Auth & DB:** Supabase  
- **API:** Chronicle Backend (NestJS)  
- **Deployment:** Vercel / Cloud Run

## 🧪 Browser tests

`npm run test:e2e` builds the app, starts it on port 3100 and runs the Playwright tests in `e2e/` (login, sign-up, writing a post, comments). Every API call is mocked in the browser, so no backend is needed. Run `npx playwright install chromium` once first. CI runs them on every PR.
