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

    // Real Roblox limited items and faces
    const realItems = ['Atackin Kraken', 'Neon Angry Droid', 'Binary Banded Boss White Hat', 'Valkyrie Helm', 'Venomshank', 'Mystic Ruby', 'Clockwork Shades', 'Sparkle Time Fedora', 'Bling Bling', 'Silver King of the Night', 'JJ5x5 White Top Hat', 'Lord of the Federation', 'Icedagger', 'Wanwood Crown', 'Bluesteel Fedora'];
    const faces = ['Madness Face', 'Catching Snowflakes', 'Pieface Jellyfreckles', 'Beast Mode', 'Super Super Happy Face', 'Punk Face', 'Playful Vampire'];
    
    const recentContext = recentMessages?.slice(-6).map((m: any) => `${m.username}: ${m.message}`).join('\n') || '';

    const systemPrompt = `You're ${selectedUser} in a Roblox LIMITED SNIPING group chat. Talk about sniping tools, settings, drops, and trades.

REAL ITEMS: ${realItems.slice(0, 8).join(', ')}
FACES: ${faces.join(', ')}

TOPICS TO DISCUSS:
- Snipe settings (refresh rates, max spend, profit margins)
- ID lists and which items to target
- Upcoming drops ("${faces[Math.floor(Math.random() * faces.length)]} drops in ${Math.floor(Math.random() * 4) + 1} hours for ${Math.floor(Math.random() * 150) + 50} robux")
- Recent snipes and profits
- RAP changes and trends
- Flip strategies

STYLE:
- lowercase, minimal punctuation
- 5-15 words, complete thoughts
- casual: ngl, fr, tbh, lol, idk (sparingly)

${shouldReply && lastMessage ? `
RECENT CHAT:
${recentContext}

Respond to the conversation with sniping-related input.
` : `
Start a sniping topic:
- mention an upcoming drop with time and price
- ask about someone's snipe settings
- share a recent snipe or flip
- discuss ID list strategies
`}

GOOD EXAMPLES:
- "madness face drops in like 2 hours for 88 robux, easy flip"
- "yo what refresh rate you guys running? i got mine at 500ms"
- "just sniped a korblox for 18k under rap lol"
- "anyone got the new limited IDs? need to update my list"
- "stitch face dropping tomorrow, might be worth adding to watchlist"
- "set my max spend to 50k, dont wanna go too crazy"
- "that headless snipe earlier was insane, 40k profit ez"

BAD (avoid):
- made up items like "violet valk" or "gilded katana"
- generic chat that isn't about sniping
- single word responses

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
