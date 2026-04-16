# Arpit Tiwari — Portfolio Website

A production-ready portfolio website for UI/UX Designer Arpit Tiwari.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install & Run

```bash
cd arpit-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
arpit-portfolio/
├── app/
│   ├── layout.tsx          # Root layout with Navbar, Footer, Cursor
│   ├── page.tsx            # Home page
│   ├── work/
│   │   ├── page.tsx        # Work listing page
│   │   └── [slug]/
│   │       ├── page.tsx    # Case study (SSG)
│   │       └── CaseStudyClient.tsx
│   ├── about/page.tsx      # About page
│   ├── contact/page.tsx    # Contact page
│   └── admin/page.tsx      # Admin panel
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CustomCursor.tsx
│   ├── ProjectCard.tsx
│   ├── SectionWrapper.tsx  # Scroll-triggered animation wrapper
│   ├── CaseStudyBlock.tsx  # TextBlock, StatBlock, QuoteBlock
│   ├── Button.tsx
│   ├── SkillsMarquee.tsx
│   └── CountUp.tsx
├── lib/
│   ├── projects.ts         # Project data (edit this to update content)
│   ├── types.ts            # TypeScript interfaces
│   └── animations.ts       # Framer Motion variants
└── public/images/          # Place project images here
```

---

## Adding / Editing Projects

### Option 1: Edit the data file directly (simplest)

Open `lib/projects.ts` and edit the `projects` array. Each project follows the `Project` interface in `lib/types.ts`.

### Option 2: Admin Panel

Visit `/admin` in your browser. Default password: `arpit2024`

Change the password in `.env.local`:
```
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

> Note: Admin panel saves to localStorage. For production persistence, connect Sanity CMS (see below).

---

## EmailJS Setup (Contact Form)

1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. Create a service (Gmail recommended)
3. Create an email template with variables: `{{from_name}}`, `{{from_email}}`, `{{message}}`
4. Copy your Service ID, Template ID, and Public Key
5. Add to `.env.local`:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

---

## Sanity CMS Setup (Optional — for production CMS)

1. Install Sanity CLI: `npm install -g @sanity/cli`
2. Create a new Sanity project: `sanity init`
3. Add your project ID to `.env.local`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```
4. Replace the data imports in pages with Sanity client queries using `@sanity/client`

---

## Deploying to Netlify

### Method 1: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Method 2: GitHub + Netlify Dashboard

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Connect your repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard (Site settings → Environment variables)
6. Install the Netlify Next.js plugin: `@netlify/plugin-nextjs` (already in `netlify.toml`)

### Environment Variables for Netlify

Add these in Netlify dashboard → Site settings → Environment variables:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
NEXT_PUBLIC_ADMIN_PASSWORD
```

---

## Adding Project Images

Place images in `public/images/` with these names:
- `erp-thumb.jpg`, `aqualeaf-thumb.jpg`, `jordan-thumb.jpg`, `syn-thumb.jpg`
- `erp-1.jpg` through `erp-3.jpg` (and same for other projects)

Recommended: 1200×900px for thumbnails, 1600×1000px for case study images.

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0B0B0C` |
| Accent (Lime) | `#C8FA64` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A1A1A1` |
| Heading Font | Clash Display |
| Body Font | Satoshi |

---

## License

Personal portfolio — all rights reserved by Arpit Tiwari.
