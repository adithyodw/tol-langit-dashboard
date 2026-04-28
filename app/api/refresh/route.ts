import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `You are a financial data extraction specialist. Search the MQL5 signal pages and extract current statistics. Return ONLY a valid JSON object — no markdown, no code fences, no preamble. Required structure:
{"strategies":{"v10":{"gain":"+X,XXX.XX%","win":"XX.XX%","pf":"X.XX","mo":"+X.XX%","ddBal":"XX.XX%","ddEq":"XX.XX%","trades":"X,XXX","wins":"X,XXX","losses":"XXX"},"v10hr":{"gain":"+XXX.XX%","win":"XX.XX%","pf":"X.XX","mo":"+XX.XX%","ddBal":"XX.XX%","ddEq":"XX.XX%","trades":"XXX","wins":"XXX","losses":"XX"},"etf":{"gain":"+XX.XX%","win":"XX.XX%","pf":"X.XX","mo":"-X.XX%","ddBal":"XX.XX%","ddEq":"XX.XX%","trades":"XXX","wins":"XXX","losses":"XX"},"etfgold":{"gain":"+XX.XX%","win":"XX.XX%","pf":"X.XX","mo":"+XX.XX%","ddBal":"XX.XX%","ddEq":"XX.XX%","trades":"XXX","wins":"XXX","losses":"XX"}},"updatedAt":"Month YYYY"}`,
        messages: [{
          role: 'user',
          content: `Extract current statistics from these MQL5 signal pages:
1. TOL LANGIT V10 (LOW RISK): https://www.mql5.com/en/signals/1083101
2. TOL LANGIT V10 HIGH RISK: https://www.mql5.com/en/signals/2296225
3. TOL LANGIT ETF: https://www.mql5.com/en/signals/2353105
4. TOL LANGIT ETF GOLD MR: https://www.mql5.com/en/signals/2360336
Return only the JSON object with current data.`,
        }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    const text = (data.content as {type:string;text?:string}[])
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Live data refresh failed:', err);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
