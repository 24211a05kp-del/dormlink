/**
 * Reason Summarization Utility
 * Currently uses deterministic logic to shorten texts.
 * Can be replaced with a Cloud Function calling an LLM (Gemini/OpenAI) in production.
 */

export const aiService = {
    summarizeReason: async (reason: string): Promise<string> => {
        if (!reason || reason.length < 20) return reason;

        // processing logic
        const sentences = reason.split(/[.!?]/).filter(s => s.trim().length > 0);

        if (sentences.length <= 2) {
            return reason.trim();
        }

        // Return the first two sentences to simulate summarization
        return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
    }
};
