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

    // Get recent active users to avoid - simulate some being "AFK"
    const recentActiveUsers = recentMessages?.slice(-4).map((m: any) => m.username) || [];
    
    // Pick 1 user, preferring someone who hasn't spoken recently (simulates different people being active)
    const availableUsers = ALLOWED_USERNAMES.filter(u => !recentActiveUsers.includes(u));
    const userPool = availableUsers.length > 0 ? availableUsers : ALLOWED_USERNAMES;
    const selectedUser = userPool[Math.floor(Math.random() * userPool.length)];

    // Check if we should respond to someone or start fresh topic
    const shouldReply = recentMessages && recentMessages.length > 0 && Math.random() > 0.3;
    const lastMessage = recentMessages?.[recentMessages.length - 1];

    // Real Roblox limited items only
    const realItems = ['Dominus Empyreus', 'Dominus Frigidus', 'Dominus Rex', 'Valkyrie Helm', 'Headless Horseman', 'Korblox Deathspeaker', 'Clockwork Shades', 'Sparkle Time Fedora', 'Green Sparkle Time Fedora', 'Violet Valk', 'Red Valk', 'Bling Bling', 'Shaggy', 'Bluesteel Fedora', 'JJ5x5', 'Perfectly Legitimate Business Hat', 'Icedagger', 'Wanwood Crown'];
    
    const recentContext = recentMessages?.slice(-6).map((m: any) => `${m.username}: ${m.message}`).join('\n') || '';

    const systemPrompt = `You're ${selectedUser} in a Roblox limited trading group chat. Have REAL conversations.

REAL ITEMS ONLY (use these exact names): ${realItems.slice(0, 10).join(', ')}

STYLE:
- lowercase, minimal punctuation
- 5-15 words, complete thoughts
- casual: ngl, fr, tbh, lol, idk (sparingly)

${shouldReply && lastMessage ? `
RECENT CHAT:
${recentContext}

You're responding to this conversation. ACTUALLY ENGAGE:
- Share a real opinion or experience
- Disagree or agree with reasoning
- Add new info to the discussion
- Ask a specific followup question
` : `
Start a topic others can discuss:
- Your opinion on a specific item's value
- Something you noticed about a real item's price
- Ask what others think about a specific trade
`}

GOOD (substantive):
- "headless dropped like 50k this week, prob gonna keep going tbh"
- "nah dominus rex is overrated, frigidus has way better demand"
- "i sold my korblox last week for 23k, kinda regret it now"
- "wait so you think valk is gonna go back up? idk man"
- "anyone know why clockwork shades been so stable lately"

BAD (avoid):
- single words like "val" or "fr"
- generic "yeah that's true" without adding anything
- made up items that don't exist
- just asking "anyone trading X" with no context

Output ONLY the message, no quotes or username prefix.`;

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
          { role: 'user', content: 'Generate the chat message.' }
        ],
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Clean up
    content = content.trim().replace(/^["']|["']$/g, '').replace(/^.*?:\s*/, '');
    
    const messages = [];
    if (content && content.length > 2) {
      messages.push({ username: selectedUser, message: content });
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
