import * as path from 'jsr:@std/path';
import { termFmt, typeOutString } from './terminalFormatting.ts';
import { getConfiguration, setHistory } from './staticData.ts';
import { singleQuery } from './actions/SingleQuery.ts';
import { IOManager, log } from './ioManager.ts';

export type ActionData = {
	configPath: string;
	historyPath: string;
};

type RuntimeMode = 'windows' | 'unix' | 'dev';

async function run(os: RuntimeMode, args: string[]) {
	let configFileLocation;
	let historyFileLocation;
	switch (os) {
		case 'windows': {
			const appData = Deno.env.get('APPDATA');
			if (!appData) {
				throw 'Could not read %APPDATA%';
			}
			const appDir = path.join(appData, 'ask');
			configFileLocation = path.join(appDir, 'config.json');
			historyFileLocation = path.join(appDir, 'hist.json');
			break;
		}
		case 'unix': {
			const home = Deno.env.get('HOME');
			if (!home) {
				throw 'Could not read $HOME';
			}
			const configHome = Deno.env.get('XDG_CONFIG_HOME') ?? path.join(home, '.config');
			const dataHome = Deno.env.get('XDG_DATA_HOME') ?? path.join(home, '.local', 'share');
			configFileLocation = path.join(configHome, 'ask', 'config.json');
			historyFileLocation = path.join(dataHome, 'ask', 'hist.json');
			break;
		}
		case 'dev':
			configFileLocation = './dev-data/dev-config.json';
			historyFileLocation = './dev-data/dev-hist.json';
			break;
	}

	const actionData = {
		configPath: configFileLocation,
		historyPath: historyFileLocation,
	};

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
					log('history reset', 'red');
					//typeOutString(termFmt('history reset', 'red'), 15);
					break;
				case '-s':
				case '--skip-history':
					skipHistory = true;
					break;
				case '-h':
				case '--help':
					log(helpString());
					return;
				case '--dev':
					break;
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

function helpString(): string {
	return `
        flag
        -h: help
        -s, --skip-history: Makes request without history
        -r, --reset: Resets history
        --dev: Uses local dev-data files
    `;
}

if (import.meta.main) {
	const devMode = Deno.args.includes('--dev');
	const args = Deno.args.filter((arg) => arg !== '--dev');
	const runtimeMode: RuntimeMode = devMode ? 'dev' : Deno.build.os === 'windows' ? 'windows' : 'unix';
	try {
		await run(runtimeMode, args);
	} catch (err) {
		log(err);
	}
}
