import { askGeminiWithRetry, GeminiError, TEXT_PROMPT } from '../askGemini.ts';
import { ActionData } from '../idx/index.ts';
import { markdownToTerminal } from '../markdown/markdowner.ts';
import { emptyHistory, getConfiguration, HistoryData, HistoryItem, readHistory, setHistory } from '../staticData.ts';
import { termFmt } from '../terminalFormatting.ts';
import { getApiKey } from './AskForKey.ts';

export async function singleQuery(reqData: ActionData, query: string, skipHistory = false) {
    const key = await getApiKey(reqData);
    const config = await getConfiguration(reqData.configPath);

    const logQueries = config.logQuerires;

    let histData: HistoryData = skipHistory ? emptyHistory() : await readHistory(reqData.historyPath);

    const fullQuery = createFullQueryFromHistory(query, histData);

    if (logQueries) {
        console.log(termFmt('   | ', 'black') + termFmt(fullQuery, 'yellow'));
    }


    try {
        const response = await askGeminiWithRetry(fullQuery, config.apiKey || '', TEXT_PROMPT);

        const newHistoryItem: HistoryItem = {
            query: query,
            timestamp: Date.now(),
            response: response
        }

        histData.history.push(newHistoryItem);
        setHistory(reqData.historyPath, histData);

        const markedDownResp = markdownToTerminal(response);
        console.log(markedDownResp);
    } catch (error) {
        if (error instanceof GeminiError) {
            termFmt(error.statusText, 'red');
        } else {
            termFmt('Unknown error', 'red');
        }
    }
}



function createFullQueryFromHistory(query: string, histData: HistoryData): string {
    const mapped = histData.history.map((histItem) => {
        const userStr = `*User:* ${histItem.query}\n`;
        const agentStr = `*Agnet:* ${histItem.response}\n`;

        return `${userStr}${agentStr}`;
    });

    return mapped.join('n') + '\n\n' + `Current User Query: ${query}`;
};