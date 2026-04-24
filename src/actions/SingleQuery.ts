import { askGeminiWithRetry, GeminiError} from '../askGemini.ts';
import { ActionData } from '../index.ts';
import { log } from '../ioManager.ts';
import { markdownToTerminal } from '../markdown/markdowner.ts';
import { emptyHistory, getConfiguration, HistoryData, HistoryItem, readHistory, setHistory } from '../staticData.ts';
import { termFmt } from '../terminalFormatting.ts';
import { createFullQueryFromHistory } from '../utils/Prompting.ts';
import { getApiKey } from './AskForKey.ts';

export async function singleQuery(reqData: ActionData, query: string, skipHistory = false) {
	const key = await getApiKey(reqData);
	const config = await getConfiguration(reqData.configPath);

	const logQueries = config.logQuerires;

	let histData: HistoryData = skipHistory ? emptyHistory() : await readHistory(reqData.historyPath);

	const fullQuery = createFullQueryFromHistory(query, histData);

	if (logQueries) {
		log(termFmt('   | ', 'black') + termFmt(fullQuery, 'yellow'));
	}

	try {
		const response = await askGeminiWithRetry(fullQuery, key || '');

		const newHistoryItem: HistoryItem = {
			query: query,
			timestamp: Date.now(),
			response: response,
		};

		histData.history.push(newHistoryItem);
		setHistory(reqData.historyPath, histData);

		const markedDownResp = markdownToTerminal(response);
		log(markedDownResp);
	} catch (error) {
		if (error instanceof GeminiError) {
			termFmt(error.statusText, 'red');
		} else {
			termFmt('Unknown error', 'red');
		}
	}
}
