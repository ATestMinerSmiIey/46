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

    const systemPrompt = `You are simulating a group chat between Roblox traders discussing the Roblox limited item trading market. Generate natural, casual messages that real traders would say.

CRITICAL RULES:
- Write EXACTLY like real teenagers/young adults chatting casually
- Use lowercase mostly, occasional caps for emphasis
- Use common abbreviations: ngl, tbh, fr, imo, lmao, bruh, lowkey, highkey
- Make typos occasionally
- Keep messages SHORT (1-15 words typically)
- NO emojis or very minimal
- Sound excited about snipes and deals
- Reference real trading concepts: RAP, value, demand, projected, hoarded items
- Talk about specific item types: dominus, valkyrie, sparkle time, korblox, limiteds
- Discuss market trends, flipping strategies, profit margins
- Be skeptical sometimes, give opinions
- React to each other naturally

TOPICS TO DISCUSS:
- Recent snipes and deals
- Item price predictions
- Market trends (rising/falling values)
- Trading tips and strategies
- Flex recent profits
- Ask for advice
- Discuss projected items
- Talk about demand changes

Generate 1-3 messages from different usernames. Format as JSON array:
[{"username": "username", "message": "message text"}]

Only use these usernames: ${ALLOWED_USERNAMES.join(', ')}`;

    const userPrompt = recentMessages && recentMessages.length > 0
      ? `Recent chat context:\n${recentMessages.map((m: any) => `${m.username}: ${m.message}`).join('\n')}\n\nGenerate natural follow-up messages that continue or start a new topic.`
      : `Start a new conversation about Roblox limited item trading.`;

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
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON from the response
    let messages = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      messages = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Fallback messages
      messages = [
        { username: ALLOWED_USERNAMES[Math.floor(Math.random() * ALLOWED_USERNAMES.length)], message: 'market been crazy lately ngl' }
      ];
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
