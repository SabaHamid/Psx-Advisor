# 📈 PSX Smart Advisor

A **Progressive Web App (PWA)** for Pakistan Stock Exchange investors. Get real-time buy/sell signals, live prices, technical indicators, and a built-in learning hub — all installable on your phone like a native app.

## ✨ Features
- 🔴 **Live PSX prices** via Yahoo Finance (15-min delay, free)
- 📊 **Buy / Sell / Hold signals** with confidence scores
- 📉 RSI, MACD, Moving Averages, Bollinger Bands — with plain-English explanations
- 💼 **Portfolio tracker** with live P&L
- 🔔 **Real-time alerts** feed
- 📚 **Learning Hub** for new investors
- 🌙 Trader & Investor modes
- 📱 **PWA** — installable on Android & iOS, works offline

## 🚀 Deploy

### GitHub + Vercel (recommended)
1. Fork or clone this repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Click **Deploy** — done!

### Manual
Just open `index.html` in a browser. For full PWA features (service worker, install prompt), it must be served over HTTPS.

## 📱 Install on Phone

**Android (Chrome):**
> Open the deployed URL → tap the menu (⋮) → "Add to Home Screen"

**iPhone (Safari):**
> Open the deployed URL → tap Share (□↑) → "Add to Home Screen"

The app will appear on your home screen like a native app, with no browser chrome.

## 🗂 Project Structure
```
psx-advisor/
├── index.html      # Main app (single-file PWA)
├── manifest.json   # PWA manifest
├── sw.js           # Service worker (offline support)
├── vercel.json     # Vercel routing config
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## 📡 Data Source
Live prices are fetched from **Yahoo Finance** via a CORS proxy. PSX tickers use the `.KA` suffix (e.g. `ENGRO.KA`, `HBL.KA`). Data is delayed ~15 minutes — sufficient for investment decisions, not HFT.

## ⚠️ Disclaimer
This app is for **educational and informational purposes only**. It does not constitute financial advice. Always do your own research before investing.

---
Built with ❤️ for Pakistani investors.
