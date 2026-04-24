import { delay, OneOrMany } from './utils.ts';

export function randomPeriods(lenght: number) {
    let outStr = '';
    for (let i = 0; i < lenght; i++) {
        outStr += Math.random() > 0.5 ? '.' : ' ';
    }
    return outStr;
}


export async function typeOutString(str: string, delayms: number){
    const chars = str.split('');
    for(let i = 0; i < chars.length; i++){
        await delay(delayms);
        process.stdout.write(chars[i]);
    }
}



function ArrayFromOneOrMany<T>(input: OneOrMany<T>): T[] {
    return Array.isArray(input) ? input : [input];
}

export type TerminalFormatOptions = 'bold' | 'dim' | 'italic' | 'underline' | 'blinking' | 'reverse' | 'hidden' | 'strikethrough'
export type TerminalColors = 'red' | 'green' | 'yellow' | 'black' | 'blue' | 'purple' | 'cyan' | 'white' | 'default';
export type TerminalColorTypes = 'fg' | 'hi';
const colorDigits: Record<TerminalColors, number> = {
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    purple: 5,
    cyan: 6,
    white: 7,
    default: 8,
}
const formatDigits: Record<TerminalFormatOptions, number> = {
    bold: 1,
    dim: 2,
    italic: 3,
    underline: 4,
    blinking: 5,
    reverse: 7,
    hidden: 8,
    strikethrough: 9
}
const reset = '\x1b[0m';

export function escapeText(text: string, codes: number[]): string {
    return `\x1b[${codes.join(';')}m${text}${reset}`
}

export function termFmt(text: string, color?: TerminalColors, bgColor?: TerminalColors, formatting: OneOrMany<TerminalFormatOptions> = []): string {
    const formatCodes = ArrayFromOneOrMany(formatting).map((format) => formatDigits[format]);
    let codesArray = [];
    if(bgColor){
        codesArray.push(40 + colorDigits[bgColor]);
    }
    if(color){
        codesArray.push(30 + colorDigits[color]);
    }
    const codes = [codesArray, formatCodes].flat();
    return escapeText(text, codes);
}

export function logFmt(text: string, color?: TerminalColors, bgColor?: TerminalColors, formatting: OneOrMany<TerminalFormatOptions> = []) {
    console.log(termFmt(text, color, bgColor, formatting));
}