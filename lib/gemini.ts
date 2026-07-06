import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusinessSession, Message } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateRoadmap(
  session: BusinessSession,
  systemPrompt: string,
  roadmapInstruction: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  });

  const businessContext = `
Business Profile:
- Name: ${session.business_name}
- Industry: ${session.industry}
- Country: ${session.country}
- Number of Employees: ${session.num_employees}
- Annual Revenue: ${session.annual_revenue || 'Not provided'}
- Marketing Budget: ${session.marketing_budget}
- Business Goals: ${session.business_goals.join(', ')}
- Biggest Growth Challenges: ${session.growth_challenges.join(', ')}
${session.additional_context ? `- Additional Context: ${session.additional_context}` : ''}
  `.trim();

  const prompt = `${businessContext}\n\n${roadmapInstruction}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    return jsonMatch[1] || jsonMatch[0];
  }
  return text;
}

export async function streamChat(
  session: BusinessSession,
  messages: Message[],
  newMessage: string,
  systemPrompt: string,
  roadmapSummary: string
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `${systemPrompt}\n\nYou are currently advising: ${session.business_name} (${session.industry} company in ${session.country}). Here is their growth roadmap summary: ${roadmapSummary}.\n\nCRITICAL INSTRUCTIONS:\n- Answer in clear, friendly, plain English prose ONLY.\n- NEVER output JSON, code blocks, triple backticks, or markdown code fences.\n- Use Markdown headings (##, ###) to structure your response into scannable sections.\n- Heavily use bullet points (starting with -) or numbered lists for readability.\n- Use very short paragraphs (1-2 sentences maximum). Avoid walls of text.\n- Keep responses concise, direct, and highly actionable.`,
  });

  const chat = model.startChat({
    history: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessageStream(newMessage);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return stream;
}
