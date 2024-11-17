import OpenAI from 'openai';

export const OpenAIModels = {
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4: 'gpt-4',
  GPT_4_32K: 'gpt-4-32k',
};

export async function summarizeTranscript(
  transcript: string
): Promise<string | null> {
  const OPEN_AI = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  const prompt = `
    Summarize the following YouTube transcript, start with in this Youtube video, and end with in conclusion {conclusion}
  
    ${transcript}
  
    Summary:
    `;

  const response = await OPEN_AI.chat.completions.create({
    model: OpenAIModels.GPT_3_5_TURBO,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}
