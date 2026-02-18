import { askGeminiWithRetry, GeminiError, TEXT_PROMPT } from "../askGemini.ts";
import { markdownToTerminal } from "../markdown/markdowner.ts";
import * as path from "jsr:@std/path";
import { logFmt, termFmt } from '../terminalFormatting.ts';
import { writeConfigFile, Configuration, defaultConfig, emptyHistory, getFile, HistoryData, HistoryItem, readHistory, setHistory } from '../staticData.ts';
import { askForKey } from '../actions/AskForKey.ts';
import { singleQuery } from '../actions/SingleQuery.ts';

export type ActionData = {
    configPath: string,
    historyPath: string
}

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
            logFmt('no support for unix, lmao', 'red');
            return;
        case 'dev':
            configFileLocation = './dev-data/dev-config.json';
            historyFileLocation = './dev-data/dev-hist.json';
            break;
    }

    const actionData = {
        configPath: configFileLocation,
        historyPath: historyFileLocation
    }

    const config = await getFile(configFileLocation, defaultConfig) as Configuration;



    let args = Deno.args;





    let skipHistory = false;
    let queryParts = [];
    let theRestAreAllPartOfQuery = false;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (theRestAreAllPartOfQuery) {
            queryParts.push(a);
        } else {
            switch (a) {
                case '-r':
                case '--reset':
                    setHistory(historyFileLocation);
                    break;
                case '-s':
                case '--skip-history':
                    skipHistory = true;
                    break;
                case '-h':
                case '--help':
                    printHelp();
                    return;
                default:
                    theRestAreAllPartOfQuery = true;
                    queryParts.push(a);
            }
        }
    }


    await singleQuery(actionData, queryParts.join(' '), skipHistory);
    console.log();
}










function printHelp(): string {
    return `
        flag
        -h: help
        -s, --skip-history: Makes request without history
        -r, --reset: Resets history
    `;
}

