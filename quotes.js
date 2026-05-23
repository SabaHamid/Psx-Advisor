export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const symList = symbols.split(',').map(s => s.replace('.KA','').trim());

  // Check if PSX market is open (Mon-Fri 9:30-15:30 PKT = UTC+5)
  const now = new Date();
  const pkt = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const day = pkt.getDay();
  const mins = pkt.getHours() * 60 + pkt.getMinutes();
  const marketOpen = day >= 1 && day <= 5 && mins >= 570 && mins < 930;

  // Try PSX market-watch (live) or EOD (closed)
  const endpoints = marketOpen
    ? ['https://dps.psx.com.pk/market-watch']
    : ['https://dps.psx.com.pk/market-watch', 'https://dps.psx.com.pk/eod'];

  for (const endpoint of endpoints) {
    try {
      const r = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://dps.psx.com.pk/',
        },
        signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
      });

      if (!r.ok) continue;
      const raw = await r.json();
      const stocks = Array.isArray(raw) ? raw : (raw.data || raw.stocks || []);
      if (!stocks.length) continue;

      const results = symList.map(sym => {
        const s = stocks.find(x =>
          (x.s || x.symbol || x.ticker || x.SYMBOL || '').toUpperCase() === sym.toUpperCase()
        );
        if (!s) return null;
        const price = s.c || s.close || s.CLOSE || s.last || s.LAST || 0;
        const chg   = s.ch || s.change || s.CHANGE || 0;
        const pct   = s.cp || s.changePercent || s.CHANGE_P || 0;
        return {
          symbol: sym + '.KA',
          regularMarketPrice: price,
          regularMarketChange: chg,
          regularMarketChangePercent: pct,
          regularMarketVolume: s.v || s.volume || s.VOLUME || 0,
          regularMarketOpen:   s.o || s.open   || s.OPEN   || price,
          regularMarketDayHigh:s.h || s.high   || s.HIGH   || price,
          regularMarketDayLow: s.l || s.low    || s.LOW    || price,
          marketClosed: !marketOpen,
        };
      }).filter(Boolean);

      if (results.length > 0) {
        return res.status(200).json({
          quoteResponse: { result: results, error: null },
          marketOpen,
        });
      }
    } catch(e) { continue; }
  }

  // Final fallback: Yahoo Finance
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (r.ok) {
      const data = await r.json();
      return res.status(200).json({ ...data, marketOpen });
    }
  } catch(e) {}

  return res.status(503).json({ error: 'All data sources unavailable', marketOpen });
}
