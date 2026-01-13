export function randomPeriods(lenght: number) {
    let outStr = '';
    for (let i = 0; i < lenght; i++) {
        outStr += Math.random() > 0.5 ? '.' : ' ';
    }
    return outStr;
}



export type ConsoleColors = 'red' | 'green' | 'yellow' | 'black' | 'blue' | 'purple' | 'cyan' | 'white' | 'default';
export type ColorTypes = 'fg' | 'hi';
const colorDigits: Record<ConsoleColors, number> = {
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
const reset = '\x1b[0m';

function getEscapeCode(color: ConsoleColors, type: ColorTypes = 'fg') {
    const digit = colorDigits[color];
    switch (type) {
        case 'fg':
            return `\x1b[3${digit}m`
        case 'hi':
            return `\x1b[9${digit}m`
    }
}

export function colorString(str: string, color: ConsoleColors = 'default', type: ColorTypes = 'fg') {
    return `${getEscapeCode(color, type)}${str}${reset}`
}

export function logColor(str: string, color: ConsoleColors = 'default', type: ColorTypes = 'fg'){
    console.log(colorString(str, color, type));
}