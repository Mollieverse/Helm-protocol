import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { intent } = await request.json();
    if (!intent) return NextResponse.json({ error: 'No intent provided' }, { status: 400 });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are a DeFi intent parser for HELM Protocol on Solana.
Parse the user's natural language intent into structured fields.
Respond with ONLY valid JSON, no markdown, no explanation.
JSON shape:
{
  "token": "token symbol e.g. SOL",
  "condition": "human readable condition e.g. price drops 10%",
  "action": "buy or sell",
  "amount": "e.g. 0.1 SOL or $50",
  "summary": "one sentence summary of the intent"
}`,
        messages: [{
          role:    'user',
          content: intent,
        }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: 'Could not parse intent' }, { status: 422 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
