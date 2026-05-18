# PesaPal

PesaPal is a React student expense tracker with Firebase Authentication, Google social sign-in, and Firestore-backed budgets and expenses.

## Features

- React Router pages for login, signup, tracker, and summary
- Email/password authentication and Google social authentication
- Firestore persistence for expenses and monthly budgets
- Responsive layout for desktop and mobile screens
- Vitest coverage threshold set above the required 30%
- GitHub Actions workflow for linting, testing, building, and deploying to GitHub Pages

## Scripts

```bash
npm run dev
npm run lint
npm run test:coverage
npm run build
```

## Deploying to Vercel

When importing this repository in Vercel, use these settings:

- Framework Preset: `Vite`
- Root Directory: `project_pesa`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

The included `vercel.json` sends all routes back to `index.html`, so React Router pages such as `/login`, `/signup`, `/tracker`, and `/summary` work after refresh.

After deployment, add your Vercel domain to Firebase Authentication authorized domains.

## Release

Current version: `1.0.0`

This project follows semantic versioning: `MAJOR.MINOR.PATCH`.
