import { GoogleGenAI } from "@google/genai";
import { ScheduleConfig, DaySchedule } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const suggestScheduleByRole = async (role: string): Promise<Partial<ScheduleConfig> | null> => {
  if (!process.env.API_KEY) {
    throw new Error("error.gemini.apiKeyMissing");
  }

  const prompt = `
    Based on the professional role of a "${role}", generate a typical weekly work schedule.
    
    Your response MUST be a valid JSON object. Do not include any text or markdown formatting like \`\`\`json before or after the JSON object.
    
    The JSON object should have the following structure:
    {
      "slotDuration": <number>,
      "weeklySchedule": [
        { 
          "day": "Monday", 
          "isEnabled": <boolean>, 
          "startTime": "HH:MM", 
          "endTime": "HH:MM",
          "overbookingRules": [{ "id": "rule-1", "startTime": "HH:MM", "endTime": "HH:MM", "capacity": <number> }]
        },
        { "day": "Tuesday", "isEnabled": <boolean>, "startTime": "HH:MM", "endTime": "HH:MM", "overbookingRules": [] },
        { "day": "Wednesday", "isEnabled": <boolean>, "startTime": "HH:MM", "endTime": "HH:MM", "overbookingRules": [] },
        { "day": "Thursday", "isEnabled": <boolean>, "startTime": "HH:MM", "endTime": "HH:MM", "overbookingRules": [] },
        { "day": "Friday", "isEnabled": <boolean>, "startTime": "HH:MM", "endTime": "HH:MM", "overbookingRules": [] },
        { "day": "Saturday", "isEnabled": <boolean>, "startTime": "HH:MM", "endTime": "HH:MM", "overbookingRules": [] },
        { "day": "Sunday", "isEnabled": <boolean>, "startTime": "HH:MM", "endTime": "HH:MM", "overbookingRules": [] }
      ]
    }

    - "startTime" and "endTime" should be in "HH:MM" 24-hour format. If a day is disabled (isEnabled: false), set times to "00:00".
    - "overbookingRules" is an array. For each rule, "capacity" means the total number of appointments allowed in that slot (e.g., capacity 2 means 1 original + 1 overbooking). The "id" can be a simple unique string like "rule-1".
    - If a day is a standard workday, create plausible overbooking rules. For example, a "hairstylist" might allow more clients (capacity: 2 or 3) during the busy 12:00-14:00 lunch period.
    - If there are no specific overbooking periods for a day, provide an empty array: "overbookingRules": [].
    - A standard work week is Monday to Friday.
    - Be realistic. For example, a "full-time dentist" might work 09:00-17:00 with no overbooking, while a "part-time barista" might have irregular hours and allow overbooking during morning rush hour.
    - Provide a complete schedule for all 7 days of the week.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.5,
        },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData: Partial<ScheduleConfig> = JSON.parse(jsonStr);

    // Basic validation
    if (parsedData.weeklySchedule && Array.isArray(parsedData.weeklySchedule) && parsedData.weeklySchedule.length === 7) {
        return parsedData;
    } else {
        throw new Error("error.gemini.invalidFormat");
    }
  } catch (error) {
    console.error("Error fetching schedule suggestion from Gemini:", error);
    throw new Error("error.gemini.suggestionFailed");
  }
};