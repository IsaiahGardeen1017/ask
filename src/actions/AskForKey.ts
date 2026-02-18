import { ActionData as ActionData } from '../idx/index.ts';
import {   getConfiguration,  writeConfigFile } from '../staticData.ts';
import { logFmt, termFmt } from '../terminalFormatting.ts';


export async function getApiKey(reqData: ActionData): Promise<string> {
    const config = await getConfiguration(reqData.configPath);
    if(config.apiKey){
        return config.apiKey
    }else{
        await askForKey(reqData);
        const newConfig = await getConfiguration(reqData.configPath);
        
        if(newConfig.apiKey){
            return newConfig.apiKey;
        }else{
            throw new Error('This should be impossible');
        }
    }
}

export async function askForKey(reqData: ActionData) {
    const config = await getConfiguration(reqData.configPath);
    console.log(termFmt('\nYou must enter a Gemini API key to use this tool - ', 'black') + termFmt('https://aistudio.google.com/api-keys', 'blue'));
    const key = prompt('Gemini key:')
    if (key) {
        config.apiKey = key;
        writeConfigFile(reqData.configPath, config);
        logFmt('saved key', 'blue');
    } else {
        logFmt('No key entered', 'red');
    }
}