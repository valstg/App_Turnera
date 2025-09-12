
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScheduleConfig } from "../types";

const client = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY!);

export async function suggestScheduleByRole(role: string): Promise<ScheduleConfig | null> {
  try {
    const prompt = `Sugiere un horario semanal para un ${role}. 
    Devuelve JSON con { slotDuration, weeklySchedule: [{day, isEnabled, startTime, endTime, overbookingRules: []}] }`;

    const res = await client.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);

    const text = res.response.text();
    if (!text) return null;

    return JSON.parse(text) as ScheduleConfig;
  } catch (err) {
    console.error("Error en suggestScheduleByRole:", err);
    return null;
  }
}
