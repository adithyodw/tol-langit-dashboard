// Backend to scrape public MQL5 signal pages and expose
// clean JSON for the React frontend. No credentials required.

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const SIGNAL_URLS = {
  v10: "https://www.mql5.com/en/signals/1083101",
  v10hr: "https://www.mql5.com/en/signals/2296225",
  etf: "https://www.mql5.com/en/signals/2353105",
  etfgold: "https://www.mql5.com/en/signals/2360336",
};

const cleanPct = (s) => (s ? s.replace(/\s+/g, "") : null);
const cleanInt = (s) =>
  s ? s.replace(/\s+/g, "").replace(/[^\d]/g, "") : null;

function extract(regex, text) {
  const m = text.match(regex);
  return m && m[1] ? m[1].trim() : null;
}

async function fetchMql5(id, url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "tol-langit-dashboard/1.0 (MQL5 scraper)",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) {
    throw new Error(`${id}: HTTP ${res.status}`);
  }
  const html = await res.text();
  // TEMP DEBUG: only for v10, first 2000 chars
  if (id === "v10") {
    console.log("=== RAW MQL5 HTML (v10, first 2000 chars) ===");
    console.log(html.slice(0, 2000));
  }

  // More tolerant patterns: allow tags/newlines and commas.
  const gain = cleanPct(
    extract(/Total:\s*([\d\s.,]+%)/i, html)
  );
  const win = cleanPct(
    extract(/Profit Trades:\s*[\d\s.,]+\s*\(([\d\s.,]+%)/i, html)
  );
  const trades = cleanInt(
    extract(/Trades:\s*([\d\s.,]+)/i, html)
  );
  const wins = cleanInt(
    extract(/Profit Trades:\s*([\d\s.,]+)\s*\(/i, html)
  );
  const losses = cleanInt(
    extract(/Loss Trades:\s*([\d\s.,]+)\s*\(/i, html)
  );
  const pf = extract(/Profit Factor:\s*([\d.,]+)/i, html);
  const ddBal = cleanPct(
    extract(/By Balance:\s*([\d\s.,\-]+%)/i, html)
  );
  const ddEq = cleanPct(
    extract(/By Equity:\s*([\d\s.,\-]+%)/i, html)
  );
  const mo = cleanPct(
    extract(/Monthly growth:\s*([\d\s.,\-]+%)/i, html)
  );
  const days = extract(/Latest trade:\s*([^<\n]+)/i, html);
  const hold = extract(/Avg holding time:\s*([^<\n]+)/i, html);

  return {
    gain,
    win,
    pf,
    mo,
    ddBal,
    ddEq,
    trades,
    wins,
    losses,
    days,
    hold,
  };
}

app.get("/api/signals", async (req, res) => {
  try {
    const [v10, v10hr, etf, etfgold] = await Promise.all([
      fetchMql5("v10", SIGNAL_URLS.v10),
      fetchMql5("v10hr", SIGNAL_URLS.v10hr),
      fetchMql5("etf", SIGNAL_URLS.etf),
      fetchMql5("etfgold", SIGNAL_URLS.etfgold),
    ]);

    const payload = {
      updatedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      source: "mql5",
      v10,
      v10hr,
      etf,
      etfgold,
    };

    res.json(payload);
  } catch (err) {
    console.error("[server] /api/signals error:", err);
    res.status(200).json({
      updatedAt: null,
      source: "error",
      errorMessage: err.message || String(err),
      v10: null,
      v10hr: null,
      etf: null,
      etfgold: null,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[server] TOL LANGIT backend (MQL5) running on port ${PORT}`);
});

