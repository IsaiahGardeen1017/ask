import * as path from "jsr:@std/path";
import { exists } from "jsr:@std/fs/exists";

import executable from "../ask.exe" with { type: "bytes" };
import uninstaller from "../ask-windows-uninstall.exe" with { type: "bytes" };
import { windows_addPathEntry } from './windows_funcs.ts';
import { Configuration, defaultConfig, HistoryData } from '../src/staticData.ts';
import { log } from '../src/ioManager.ts';

try {
    driver();
} catch (err) {
    log(`Something didn't work`, 'red');
    prompt('press any key to exit');
}


const defConfig: Configuration = defaultConfig();
const defaultHistory: HistoryData = {history: []}

async function driver() {


    const appData = Deno.env.get("APPDATA");
    if (!appData) {
        throw new Error("Could not read %APPDATA%");
    }
    log(`installing at ${appData}`);


    const appDir = path.join(appData, 'ask');
    if (await exists(appDir)) {
        const wipeoutExisting = confirm("Installation detected, reinstall?");
        if (wipeoutExisting) {
            Deno.removeSync(appDir, { recursive: true });
        } else {
            log('exiting instillation')
            return;
        }
    }
    await Deno.mkdirSync(appDir);
    await Deno.writeTextFileSync(path.join(appDir, 'config.json'), JSON.stringify(defConfig));
    await Deno.writeTextFileSync(path.join(appDir, 'hist.json'), JSON.stringify(defaultHistory));

    
    if (executable) {
        const exePath = path.join(appDir, 'ask.exe');
        await Deno.writeFileSync(exePath, executable);
    }

    if (uninstaller) {
        const exePath = path.join(appDir, 'uninstall.exe');
        await Deno.writeFileSync(exePath, uninstaller);
    }

    
    windows_addPathEntry(appDir, 'User');
    log('Added \'ask\' to User PATH');
    
    log('Install complete!');
    prompt('press any key to exit');
}


