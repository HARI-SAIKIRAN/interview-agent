import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, role, experienceLevel } = await req.json();

    const systemPrompt = `You are an elite, highly technical, and adaptive AI Interviewer conducting an interview for a ${experienceLevel} ${role} position.

    YOUR BEHAVIOR RULES:
    1. Do NOT just read a list of static questions.
    2. Respond to the candidate's answer naturally.
    3. ADAPTIVE PROBING: If their answer is brief, vague, or buzzword-heavy, call it out politely and demand specifics (e.g., "Can you walk me through the exact trade-offs you considered?").
    4. If their answer is detailed and strong, acknowledge key points briefly and move deeper into a follow-up or next technical challenge.
    5. Keep responses concise (2-4 sentences max) so it feels like a real voice/text interview.
    6. Maintain a professional, sharp, yet encouraging tone.`;

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback Mock Response if no API key is set yet
    if (!apiKey) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      let mockReply = `That's an interesting approach regarding "${lastUserMsg.slice(0, 30)}...". Could you go deeper into how you measure performance bottlenecks and handle edge cases in that setup?`;
      
      return NextResponse.json({
        role: "assistant",
        content: mockReply,
        metrics: {
          clarityScore: Math.floor(Math.random() * 20) + 80,
          depthScore: Math.floor(Math.random() * 30) + 70,
        }
      });
    }

    // OpenAI API Call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Could you clarify that point further?";

    return NextResponse.json({
      role: 'assistant',
      content: reply,
      metrics: {
        clarityScore: 85,
        depthScore: 78,
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to process interview response" }, { status: 500 });
  }
}