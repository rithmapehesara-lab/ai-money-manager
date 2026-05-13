# 💰 AI Money Manager

A premium, AI-powered personal finance app built with **React + Vite**. Supports both **Sinhala and English** 🇱🇰.

![AI Money Manager](https://img.shields.io/badge/React-18-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite) ![Recharts](https://img.shields.io/badge/Recharts-2-orange)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Balance hero, wallet cards, spending pie chart, widgets |
| 💳 **Multiple Wallets** | Cash, Bank, Credit Card with live balances |
| ➕ **Add Transactions** | Numpad, quick amounts, AI auto-categorize, receipt scan |
| 🔍 **Smart Search** | Filter by name, category, or custom tags |
| 🏷️ **Custom Tags** | Tag transactions (e.g. #work, #food) and filter |
| 🎯 **Savings Goals** | Track goals with progress rings, quick-add chips, color picker |
| 💰 **Budget Goals** | Per-category spending limits with color alerts |
| 📊 **Net Worth Tracker** | Assets + Debts → live net worth |
| 🔁 **Recurring Transactions** | View upcoming recurring payments |
| 💱 **Currency Converter** | LKR ↔ USD, EUR, GBP, AUD, SGD, INR, JPY |
| ✨ **AI Advisor** | Chat with Claude AI about your finances |
| 📸 **Receipt Scan** | AI extracts amount + category from photo |
| 🔐 **PIN Lock** | 4-digit PIN to secure the app |
| 🌐 **Sinhala / English** | Full UI translation toggle |
| 🔔 **Overspending Alerts** | Banner when budget limits are exceeded |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-money-manager.git
cd ai-money-manager

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔑 AI Features Setup

The AI features use the **Anthropic Claude API**. To enable them:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Create a `.env` file in the root:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

3. Update the API call in `src/App.jsx`:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
}
```

> ⚠️ **Note:** For production, proxy API calls through a backend to keep your API key secure.

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **Recharts** — Charts (pie, bar)
- **Claude API** — AI advisor, auto-categorize, receipt scan
- **Google Fonts** — Playfair Display + Outfit

---

## 📁 Project Structure

```
ai-money-manager/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main app component (all features)
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles & animations
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🌐 Deploy to Vercel / Netlify

```bash
# Vercel
npx vercel

# Netlify
npx netlify deploy --prod --dir=dist
```

---

## 📸 Screenshots

> Dark gold premium fintech aesthetic with Sinhala/English support.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

Made with ❤️ and ✨ AI
