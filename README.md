# PureBless Banking

🏦 **Complete Banking Application with Business Management Features**

A modern, responsive banking web application built with React + TypeScript that includes personal banking operations and business management tools such as invoicing and payment processing.

---

## Live Demo

**🌐 Live Application**: https://john67k.github.io/purebless-banking/

> If the live demo is not up-to-date, push new changes to the `main` branch or check the GitHub Actions workflow for Pages deployment.

---

## Features

### Banking Operations
- 💸 Send & Receive Money
- 📈 Top Up Account
- 💵 Cash Out
- 📋 Transaction History
- 🧾 Digital Receipts

### Business Management
- 📄 Invoice Creation & Management
- 📝 Check Writing System
- 💳 Payment Processing
- 📊 Business Analytics / Reporting

### Technical
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS + Framer Motion for UI and animations
- 📱 Mobile responsive layout
- 📊 Optional Vercel Analytics integration
- 🚀 Optimized production build (Vite)

---

## Quick Start (Development)

Prerequisites: Node.js (LTS) and npm or pnpm

```bash
# Clone the repository
git clone https://github.com/john67k/purebless-banking.git
cd purebless-banking

# Install dependencies
npm install
# or
# pnpm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Notes:
- The project uses Vite. If you use pnpm, update scripts or use npm as above.

---

## Deployment

This repository is configured to deploy to GitHub Pages. Typical deployment flow:

1. Push your changes to the `main` branch.
2. GitHub Actions (if present) or GitHub Pages will build and publish the site to the repository Pages URL.

If GitHub Pages is not currently deployed, enable it in Settings → Pages and select the branch (e.g., `gh-pages` or `main`) and the folder (`/ (root)` or `/docs`).

To automate with GitHub Actions (example):
- Add a workflow that builds the app (npm ci && npm run build) and deploys to GitHub Pages using actions/configs (e.g., peaceiris/actions-gh-pages or the official pages action).

---

## Project Structure (high level)

- src/ - React source files
- public/ - static assets
- package.json - scripts & dependencies
- README.md - this file

---

## Contributing

Contributions are welcome. Suggested flow:
1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes and open a pull request against `main`

Please include descriptive commit messages and update/add tests where appropriate.

---

## License

Specify the project license here (e.g., MIT). If you want me to add a LICENSE file, tell me which license to use.

---

## Contact

Created by john67k. For questions or support, open an issue or contact the maintainer.

---

**Built with ❤️ for modern banking experiences**