export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const symList = symbols.split(',').map(s => s.replace('.KA','').trim());

  try {
    // Use PSX official data portal — direct from Pakistan Stock Exchange
    const psxRes = await fetch('https://dps.psx.com.pk/market-watch', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://dps.psx.com.pk/',
      }
    });
    if (!psxRes.ok) throw new Error('PSX ' + psxRes.status);
    const raw = await psxRes.json();
    const stocks = Array.isArray(raw) ? raw : (raw.data || raw.stocks || []);

    const results = symList.map(sym => {
      const s = stocks.find(x => (x.s||x.symbol||x.ticker||'').toUpperCase() === sym.toUpperCase());
      if (!s) return null;
      const price = s.c||s.close||s.last||0;
      return {
        symbol: sym+'.KA',
        regularMarketPrice: price,
        regularMarketChange: s.ch||s.change||0,
        regularMarketChangePercent: s.cp||s.changePercent||0,
        regularMarketVolume: s.v||s.volume||0,
        regularMarketOpen: s.o||s.open||price,
        regularMarketDayHigh: s.h||s.high||price,
        regularMarketDayLow: s.l||s.low||price,
      };
    }).filter(Boolean);

    return res.status(200).json({ quoteResponse: { result: results, error: null } });

  } catch(err) {
    // Fallback to Yahoo Finance
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      return res.status(200).json(await r.json());
    } catch(e) {
      return res.status(500).json({ error: err.message + ' | ' + e.message });
    }
  }
}
