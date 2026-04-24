import { HistoryData } from '../staticData.ts';

export type PromptKeys = 'TEXT_PROMPT';

export const Prompts: Record<PromptKeys, string> = {
    TEXT_PROMPT: `
                    You're Role: You are being used in a cli tool for simple queries a developer may have when in the terminal, for this reason do not give overly long answers. 
                    Use judgment, If the user is asking for simple commands give them the command with maybe one line of explanation
                    Keep your answers short unless specifically asked for a long response
                    `
}


export function createFullQueryFromHistory(query: string, histData: HistoryData): string {
    const mapped = histData.history.map((histItem) => {
        const userStr = `*User:* ${histItem.query}\n`;
        const agentStr = `*Agent:* ${histItem.response}\n`;

        return `${userStr}${agentStr}`;
    });

    return mapped.join('n') + '\n\n' + `Current User Query: ${query}`;
}