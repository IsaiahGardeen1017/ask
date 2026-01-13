import { askGeminiWithRetry, GeminiError, TEXT_PROMPT } from "../askGemini.ts";
import { markdownToTerminal } from "../markdowner.ts";
import { colorString, logColor } from '../terminalFormatting.ts';
import * as path from "jsr:@std/path";

export async function run(os: 'windows' | 'unix' | 'dev') {
    try {
        await _run(os);
    } catch (err) {
        console.log(err);
    }
}
async function _run(os: 'windows' | 'unix' | 'dev') {
    let configFileLocation;
    let historyFileLocation;
    switch (os) {
        case 'windows': {
            const appData = Deno.env.get("APPDATA");
            if (!appData) {
                throw "Could not read %APPDATA%";
            }
            configFileLocation = path.join(appData, './config.json');
            historyFileLocation = path.join(appData, './hist.json');
            break;
        }
        case 'unix':
            logColor('no support for unix, lmao', 'red');
            return;
            break;
        case 'dev':
            configFileLocation = './dev-data/dev-config.json';
            historyFileLocation = './dev-data/dev-hist.json';
            break;
    }

    const config = await getFile(configFileLocation, defaultConfig) as Configuration;



    let args = Deno.args;

    const askKey = () => {
        console.log(colorString('\nYou must enter a Gemini API key to use this tool - ', 'black') + colorString('https://aistudio.google.com/api-keys', 'blue'));
        const key = prompt('Gemini key:')
        if (key) {
            config.apiKey = key;
            writeFile(configFileLocation, config);
            logColor('saved key', 'blue');
        } else {
            logColor('No key entered', 'red');
        }
    }



    let skipHistory = false;
    let queryParts = [];
    let allQuery = false;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (allQuery) {
            queryParts.push(a);
        } else {
            switch (a) {
                case '-r':
                case '--reset':
                    setHistory(historyFileLocation);
                    break;
                case '-h':
                case '--skip-history':
                    skipHistory = true;
                    break;
                case '-k':
                case '--key':
                    askKey();
                    i = args.length + 1;
                    return;
                default:
                    allQuery = true;
                    queryParts.push(a);
            }
        }
    }


    let histData: HistoryData = defaultHistory();
    if (!skipHistory) {
        histData = await readHistory(historyFileLocation);
    }
    skipHistory ? logColor('skipping history', 'black') : logColor(`using last ${histData?.history.length} queries`, 'black');






    const query = args.join(' ');
    console.log(colorString('   | ', 'black') + colorString(query, 'yellow'));


    //Figure out API key
    if (!config.apiKey) {
        await askKey();
    }
    if (!config.apiKey) {
        return;
    }

    try {
        const response = await askGeminiWithRetry(query, config.apiKey || '', TEXT_PROMPT);
        const markedDownResp = markdownToTerminal(response);
        console.log(response);
    } catch (error) {
        if (error instanceof GeminiError) {
            logColor(error.statusText, 'red');
        } else {
            logColor('Unknown error', 'red', 'hi');
        }
    }

    console.log();
}



async function getFile(path: string, defaultData: () => any): Promise<any> {
    let data: Configuration;
    try {
        return await JSON.parse(Deno.readTextFileSync(path));
    } catch (err) {
        data = defaultData();
        try {
            await Deno.writeTextFileSync(path, JSON.stringify(data));
            return data;
        } catch (err) {
            throw `could not read or write file: ${path}`;
        }
    }
}

async function writeFile(path: string, data: any) {
    try {
        await Deno.writeTextFileSync(path, JSON.stringify(data));
    } catch (err) {
        throw `could not write file: ${path}`;
    }
}



export type Configuration = {
    apiKey?: string
}

function defaultConfig() {
    return {
    }
}


export type HistoryData = {
    history: {
        timestamp: number,
        query: string,
        response: string
    }[];
}


function defaultHistory(): HistoryData {
    return { history: [] };
}

async function readHistory(path: string): Promise<HistoryData> {
    return await getFile(path, defaultHistory) as HistoryData;
}

async function setHistory(path: string, data: HistoryData = defaultHistory()) {
    await writeFile(path, data);
}