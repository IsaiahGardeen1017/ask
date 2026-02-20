import { logFmt, randomPeriods, TerminalColors, TerminalFormatOptions } from './terminalFormatting.ts';
import { OneOrMany } from './utils.ts';

export type status = 'idle' | 'loading-p'

const loadingBarLength = 50;

export class IOManager {
    loadingInterval: number | undefined;

    constructor(){
    }

    log(text: string, color?: TerminalColors, bgColor?: TerminalColors, formatting: OneOrMany<TerminalFormatOptions> = []){
        logFmt(text, color, bgColor, formatting);
    }

    startLoading(){
        if(this.loadingInterval){
            return;
        }

        this.loadingInterval = setInterval(() => {
            Deno.stdout.writeSync(
                new TextEncoder().encode(`\r${randomPeriods(loadingBarLength)}`),
              );
        }, 50);

    }

    stopLoading(){
        clearInterval(this.loadingInterval);
        this.loadingInterval = undefined;
    }

}


export const iom = new IOManager();


export async function loadUntil<T>(promise: Promise<T>): Promise<T> {
    iom.startLoading();
    const ret = await promise;
    iom.stopLoading();
    return ret;
}

export function log(text?: string | unknown, color?: TerminalColors, bgColor?: TerminalColors, formatting: OneOrMany<TerminalFormatOptions> = []){
    const txt = `${text || ''}`;
    iom.log(txt, color, bgColor, formatting);
}