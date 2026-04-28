# TOL LANGIT Capital — Institutional Trading Analytics Dashboard

Live algorithmic strategy dashboard for **TOL LANGIT Capital**, tracking four systematic trading strategies across MT4 and MT5 platforms. All data is sourced from independently verified live accounts on MQL5, MyFXBook, IC Markets SignalStart, and ZuluTrade.

**Manager:** Adithyo Dewangga Wijaya · Singapore  
**Active Since:** January 2021  
**Platform:** Next.js 14 · TypeScript · PostgreSQL

---

## Strategies (as of April 2026)

### TOL LANGIT V10 — LOW RISK
> 5+ year live track record · MT4 · Fully Automated

| Metric | Value |
|---|---|
| Total Gain | +1,447.47% |
| Monthly Gain | +2.65% |
| Annual CAGR | ~67.1% p.a. |
| Profit Factor | 2.73 |
| Win Rate | 81.50% |
| Max Balance DD | 10.18% |
| Max Equity DD | 72.94% |
| Total Trades | 4,519 |
| Duration | ~5 Years 3 Months |

Annual returns: 2021 +110.41% · 2022 +63.02% · 2023 +39.16% · 2024 +57.74%

Links: [MQL5](https://www.mql5.com/en/signals/1083101) · [MyFXBook](https://www.myfxbook.com/members/adithyodw/tol-langit-v10/8671765) · [SignalStart](https://icmarkets.signalstart.com/analysis/tol-langit-v10/232541) · [ZuluTrade](https://www.zulutrade.com/trader/417743/trading)

---

### TOL LANGIT V10 HIGH RISK — HIGH RISK
> 13-month live track record · MT4 · Aggressive Grid

| Metric | Value |
|---|---|
| Total Gain | +957.48% |
| Monthly Gain | +14.31% |
| Annual Forecast | ~173.58% p.a. |
| Profit Factor | 2.49 |
| Win Rate | 93.84% |
| Max Balance DD | 17.74% |
| Max Equity DD | 95.28% |
| Total Trades | 715 |
| Duration | ~13 Months |

Links: [MQL5](https://www.mql5.com/en/signals/2296225) · [MyFXBook](https://www.myfxbook.com/members/adithyodw/tol-langit-v10-high-risk/11424740) · [SignalStart](https://icmarkets.signalstart.com/analysis/tol-langit-high-risk/278500)

---

### TOL LANGIT ETF — HIGH RISK
> 4-month live track record · MT5 · No Grid · Forex + Gold

| Metric | Value |
|---|---|
| Abs. Gain (MyFXBook) | +39.66% |
| Monthly Gain | -7.31% |
| Profit Factor | 1.39 |
| Win Rate | 80.00% |
| Max Balance DD | 85.66% |
| Max Equity DD | 64.01% |
| Total Trades | 515 |
| Duration | ~4 Months |

Links: [MQL5](https://www.mql5.com/en/signals/2353105) · [MyFXBook](https://www.myfxbook.com/members/adithyodw/tol-langit-etf/11891377) · [SignalStart](https://icmarkets.signalstart.com/analysis/tol-langit-etf/285680) · [ZuluTrade](https://www.zulutrade.com/trader/430869/trading)

---

### TOL LANGIT ETF GOLD MR — MEDIUM RISK
> 10-week live track record · MT5 · No Grid · Gold Specialist

| Metric | Value |
|---|---|
| Total Gain | +100.77% |
| Monthly Gain | +117.92% |
| Profit Factor | 1.80 |
| Win Rate | 77.81% |
| Max Balance DD | 40.32% |
| Max Equity DD | 29.21% |
| Total Trades | 320 |
| Duration | ~2 Months |

Primary instruments: XAUUSD (262 deals) · AUDCAD (58 deals)

Links: [MQL5](https://www.mql5.com/en/signals/2360336) · [MyFXBook](https://www.myfxbook.com/members/adithyodw/tol-langit-etf-mr/12023120)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma)
- **API Integrations:** MQL5 Signals API, MyFXBook API, IC Markets SignalStart
- **Styling:** CSS Modules + Design tokens
- **Fonts:** Playfair Display · IBM Plex Sans · IBM Plex Mono
- **Deployment:** Vercel

## Development

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for required keys:
- `MYFXBOOK_EMAIL` / `MYFXBOOK_PASSWORD`
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`

## Links

- Manager profile: [MQL5](https://www.mql5.com/en/users/adithyodw) · [MyFXBook](https://www.myfxbook.com/members/adithyodw) · [LinkedIn](https://sg.linkedin.com/in/adithyodewangga)
- Broker: [IC Markets](https://icmarkets.com/?camp=49934)
- Telegram: [t.me/tol_langit](https://t.me/tol_langit)
