import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../config';
import { ExecutionPlan, TaskStep, AutonomyMode, SalesAnalysisResult, RecommendationItem } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!CONFIG.GEMINI_API_KEY) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });
  }
  return genAIClient;
}

export const GeminiService = {
  isConfigured(): boolean {
    return Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.trim().length > 0);
  },

  getModelName(): string {
    return CONFIG.LLM_MODEL || 'gemini-2.5-flash';
  },

  getModelNames(): string[] {
    const configured = CONFIG.LLM_MODEL || 'gemini-2.5-flash';
    // Prioritize configured model, followed by known stable alternatives
    const candidates = [configured, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
    return [...new Set(candidates.filter(Boolean))];
  },

  /**
   * Use Gemini to formulate an execution plan for a business goal.
   * Gracefully falls back if Gemini is not configured or encounters an API error.
   */
  async generateExecutionPlan(
    goal: string,
    autonomyMode: AutonomyMode
  ): Promise<ExecutionPlan | null> {
    const ai = getClient();
    if (!ai) return null;

    const systemPrompt = `You are Paytm WorkMate, an autonomous enterprise AI teammate for financial and business analytics.
Convert the user's business goal into a structured JSON execution plan.
Available tools in registry:
- "understand_objective": Parse goal, identify period and target KPIs
- "read_sales_data": Connect and load sales transaction dataset
- "validate_dataset": Check column schemas and data integrity
- "analyze_sales": Calculate GMV, order volume, AOV, category shares, and trends
- "detect_anomalies": Statistical Z-score detection of revenue dips & discount margin erosion
- "generate_insights": Synthesize business findings into executive commentary
- "generate_recommendations": Strategic recommendations with ROI impact
- "verify_results": Independent mathematical cross-check against raw ground-truth data
- "request_approval": Governance step to pause for human authorization before consequential actions (used in Copilot mode)
- "generate_report": Compile executive report, PDF, and Excel workbooks

Return ONLY valid JSON matching this schema:
{
  "summary": "Brief explanation of plan",
  "steps": [
    {
      "id": "step_1",
      "order": 1,
      "title": "Short title",
      "description": "What will be done",
      "tool": "tool_name"
    }
  ]
}`;

    const modelsToTry = this.getModelNames();
    for (const modelName of modelsToTry) {
      try {
        console.log(`✨ [Gemini AI] Trying model "${modelName}" for goal: "${goal}"`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Business Goal: "${goal}"\nAutonomy Mode: "${autonomyMode}"\nFormulate the sequential execution plan.`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json'
          }
        });

        const responseText = response.text;
        if (!responseText) continue;

        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
          console.log(`✅ [Gemini AI] Successfully generated ${parsed.steps.length} plan steps via ${modelName}!`);
          return {
            goal,
            summary: parsed.summary || `Plan formulated dynamically by Google Gemini (${modelName}).`,
            autonomyMode,
            steps: parsed.steps.map((s: any, idx: number) => ({
              id: s.id || `step_${idx + 1}`,
              order: s.order || idx + 1,
              title: s.title || `Step ${idx + 1}`,
              description: s.description || '',
              tool: s.tool || 'understand_objective',
              status: 'PENDING' as const
            }))
          };
        }
      } catch (err: any) {
        console.warn(`⚠️ [Gemini AI] Model ${modelName} failed: ${err.message || String(err)}`);
        // Continue to try next candidate model
      }
    }

    console.log('ℹ️ [Gemini AI] Using deterministic planner fallback.');
    return null;
  },

  /**
   * Use Gemini 2.5 Flash to interpret deterministic numbers and generate executive insights.
   */
  async enhanceInsights(
    analysis: Partial<SalesAnalysisResult>
  ): Promise<{ insights: string[]; recommendations: RecommendationItem[] } | null> {
    const ai = getClient();
    if (!ai) return null;

    const prompt = `You are a Senior Paytm VP of Operations and Business Analytics.
Given these deterministically verified metrics from September 2024:
- Total Gross GMV: ₹${analysis.totalRevenue?.toLocaleString('en-IN')}
- Orders: ${analysis.orderCount}
- Average Order Value: ₹${analysis.averageOrderValue}
- Top Category: ${analysis.topCategory}
- Low Category: ${analysis.lowPerformingCategory}
- Detected Anomalies: ${JSON.stringify(analysis.anomalies?.map(a => ({ date: a.date, type: a.type, dev: a.deviationPercent })))}

Generate 4 executive insights and 3 high-impact strategic recommendations.
Return ONLY valid JSON matching this schema:
{
  "insights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "recommendations": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "title": "Short title",
      "description": "Specific action",
      "estimatedImpact": "e.g. +₹350,000 GMV or 3.2% margin uplift"
    }
  ]
}`;

    const modelsToTry = this.getModelNames();
    for (const modelName of modelsToTry) {
      try {
        console.log(`✨ [Gemini AI] Generating executive insights via "${modelName}"...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const responseText = response.text;
        if (!responseText) continue;

        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed.insights) && Array.isArray(parsed.recommendations)) {
          console.log(`✅ [Gemini AI] Executive insights generated via ${modelName}!`);
          return parsed;
        }
      } catch (err: any) {
        console.warn(`⚠️ [Gemini AI] Insights generation fallback on ${modelName}: ${err.message || String(err)}`);
        // Continue to next model candidate
      }
    }

    return null;
  }
};
