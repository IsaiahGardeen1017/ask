import * as path from "jsr:@std/path";
import { exists } from "jsr:@std/fs/exists";
import { logColor } from '../src/terminalFormatting.ts';
import { windows_removePathEntry } from './windows_funcs.ts';

try {
    driver();
} catch (err) {
    logColor(`Something didn't work`, 'red');
}

async function driver() {


    const appData = Deno.env.get("APPDATA");
    if (!appData) {
        throw new Error("Could not read %APPDATA%");
    }
    console.log(`uninstalling at ${appData}`);


    const appDir = path.join(appData, 'ask');
    if (await exists(appDir)) {
        Deno.removeSync(appDir, { recursive: true });
    }

    await windows_removePathEntry(appDir, 'User');
    await windows_removePathEntry('C:\\ask', 'User');    
    console.log('Uninstall complete!');

    prompt('press any key to exit');
}


