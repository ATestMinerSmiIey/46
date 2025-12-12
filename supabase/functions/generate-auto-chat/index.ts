import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_USERNAMES = [
  '00nlylexx',
  'JUST_KKE',
  'lyicals',
  'epetted',
  'Lowrises',
  'WHENDOESTHEPARTYSTOP'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { recentMessages } = await req.json();

    // Pick 1-2 usernames to respond (usually just 1)
    const numResponders = Math.random() > 0.7 ? 2 : 1;
    const shuffled = [...ALLOWED_USERNAMES].sort(() => Math.random() - 0.5);
    const selectedUsernames = shuffled.slice(0, numResponders);

    const systemPrompt = `You are simulating a SINGLE message from a Roblox trader in a casual group chat. Write EXACTLY like a real teenager chatting.

CRITICAL RULES:
- Generate ONLY 1 short message
- Write in lowercase, casual style
- Use abbreviations naturally: ngl, tbh, fr, imo, lmao, bruh, lowkey, highkey, rn, tho
- Make occasional typos (like "teh" or missing letters)
- Keep it SHORT (3-12 words max)
- NO emojis or minimal
- Sound natural, not scripted
- Reference trading: RAP, value, demand, projected, limiteds, dominus, valk, sparkle time, korblox

TOPICS (pick one naturally):
- React to a recent message or snipe
- Share a quick opinion on an item
- Ask a casual question
- Flex a small win
- Comment on market trends

The username sending this message is: ${selectedUsernames[0]}

Return ONLY the message text, nothing else. No quotes, no username prefix.`;

    const userPrompt = recentMessages && recentMessages.length > 0
      ? `Recent chat:\n${recentMessages.slice(-3).map((m: any) => `${m.username}: ${m.message}`).join('\n')}\n\nWrite a natural reply or new comment.`
      : `Start with a casual comment about Roblox limited trading.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Clean up the response
    content = content.trim().replace(/^["']|["']$/g, '');
    
    // Build messages array
    const messages = [];
    if (content) {
      messages.push({ username: selectedUsernames[0], message: content });
    }

    // Occasionally add a second short reply (30% chance)
    if (numResponders > 1 && messages.length > 0) {
      const secondPrompt = `Someone just said: "${content}"\n\nWrite a very short reaction (2-6 words) like "fr" or "thats crazy" or "lmao no way". The username is ${selectedUsernames[1]}.`;
      
      const secondResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Write a 2-6 word casual reaction. No quotes. Lowercase. Like a teen would reply.' },
            { role: 'user', content: secondPrompt }
          ],
          temperature: 0.9,
        }),
      });

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        let secondContent = secondData.choices?.[0]?.message?.content || '';
        secondContent = secondContent.trim().replace(/^["']|["']$/g, '');
        if (secondContent && secondContent.length < 50) {
          messages.push({ username: selectedUsernames[1], message: secondContent });
        }
      }
    }

    return new Response(JSON.stringify({ messages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating auto chat:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
