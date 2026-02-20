
import * as path from "jsr:@std/path";
import { termFmt, typeOutString } from '../terminalFormatting.ts';
import { getConfiguration, setHistory } from '../staticData.ts';
import { singleQuery } from '../actions/SingleQuery.ts';
import { loadUntil, log } from '../ioManager.ts';
import { delay } from '../utils.ts';

export type ActionData = {
    configPath: string,
    historyPath: string
}

export async function run(os: 'windows' | 'unix' | 'dev') {
    try {
        await _run(os);
    } catch (err) {
        log(err);
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
            log('no support for unix, lmao', 'red');
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
                    typeOutString(termFmt('history reset', 'red'), 15);
                    break;
                case '-s':
                case '--skip-history':
                    skipHistory = true;
                    break;
                case '-h':
                case '--help':
                    printHelp();
                    return;
                case '-c':
                case '--config': {
                    const config = await getConfiguration(configFileLocation);
                    log(configFileLocation);
                    log(JSON.stringify(config, null, '\t'));
                    return;
                }
                default:
                    theRestAreAllPartOfQuery = true;
                    queryParts.push(a);
            }
        }
    }


    if (queryParts.length > 0) {
        await singleQuery(actionData, queryParts.join(' '), skipHistory);
    }
    log();
}










function printHelp(): string {
    return `
        flag
        -h: help
        -s, --skip-history: Makes request without history
        -r, --reset: Resets history
    `;
}

