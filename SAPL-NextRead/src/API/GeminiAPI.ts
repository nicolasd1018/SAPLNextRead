import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = "AQ.Ab8RN6KFaOJjiKbssSZyEgx9SbFEX61Q-uK-pgF78CDZT8lmMw";

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function searchHelper(title: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Show the top 3 possible titles of real books that might match this partial or mistyped title',
  });
}
