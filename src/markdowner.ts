import test from 'node:test';
import { ConsoleColors, escapeText, termFmt, TerminalFormatOptions } from './terminalFormatting.ts';

const inlineCodeColor: ConsoleColors = 'blue';
const inlineCodeBgColor: ConsoleColors = 'black';

export function markdownToTerminal(markdownString: string): string {

    const { columns, rows } = Deno.consoleSize();

    let finalStrs: string[] = [];
    const lines = markdownString.replaceAll('\r', '').split('\n');
    let isInCodeBlock = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const perLinFunction = (line: string) => {
            let text = line;
            let color: ConsoleColors | undefined = undefined;
            let bgColor: ConsoleColors | undefined = undefined;
            let formats: TerminalFormatOptions[] = []

            if(text === '```'){
                isInCodeBlock = !isInCodeBlock;
                return;
            }else if (text.startsWith('```')){
                if(text.endsWith('```') && text.length > 6){
                    //Do nothing, inline code check will get this
                }else if(isInCodeBlock){
                    isInCodeBlock = false;
                    let potText = text.substring(3);
                    if(!potText){
                        return;
                    }else{
                        text = potText;
                    }
                }else{
                    isInCodeBlock = true;
                    return;
                }
            }

            if(isInCodeBlock){
                const formatted = termFmt(text.padEnd(columns), inlineCodeColor, inlineCodeBgColor);
                finalStrs.push(formatted);
                return;
            }


            if (line.startsWith('######')) {
                text = line.substring(7);
                color = 'purple'
            } else if (line.startsWith('#####')) {
                text = line.substring(6);
                color = 'blue';
            } else if (line.startsWith('####')) {
                text = line.substring(5);
                color = 'green';
            } else if (line.startsWith('###')) {
                text = line.substring(4);
                color = 'cyan';
            } else if (line.startsWith('##')) {
                text = line.substring(3);
                color = 'yellow';
            } else if (line.startsWith('#')) {
                text = line.substring(2);
                color = 'red';
            }

            const surroundData = handleBoldItalics(text);
            surroundData.formats.forEach((fmt) => {
                if (!formats.includes(fmt)) {
                    formats.push(fmt)
                }
            });
            text = surroundData.text;


            //Inline code
            if (text.startsWith('```') && text.endsWith('```') && text.length > 6) {
                text = `${text.substring(3, text.length - 3)}`;
                bgColor = inlineCodeBgColor;
                color = inlineCodeColor
            } else if (text.startsWith('`') && text.endsWith('`') && text.length > 2) {
                text = `${text.substring(1, text.length - 1)}`;
                bgColor = inlineCodeBgColor;
                color = inlineCodeColor
            }

            

            if(text.trimStart().startsWith('* ')){
                text = text.replace('*', '•');
            }


            const formatted = termFmt(text, color, bgColor, formats);
            finalStrs.push(formatted);
        }
        perLinFunction(line);
    }
    return finalStrs.join('\n');
}


function handleBoldItalics(text: string, existingFormats: TerminalFormatOptions[] = []): { text: string, formats: TerminalFormatOptions[] } {
    const potentialFormats: TerminalFormatOptions[] = [];
    let t = text;

    if (t.startsWith('***') && t.endsWith('***') && t.length > 6) {
        potentialFormats.push('bold');
        potentialFormats.push('italic');
        t = t.substring(3, t.length - 3);
    } else if (t.startsWith('**') && t.endsWith('**') && t.length > 4) {
        potentialFormats.push('bold');
        t = t.substring(2, t.length - 2);
    } else if (t.startsWith('*') && t.endsWith('*') && t.length > 2) {
        potentialFormats.push('italic');
        t = t.substring(1, t.length - 1);
    } else if (t.startsWith('~~') && t.endsWith('~~') && t.length > 4) {
        potentialFormats.push('bold');
        t = t.substring(2, t.length - 2);
    } else {
        return {
            text,
            formats: existingFormats
        }
    }


    if (t.startsWith(' ')) {
        //Had valid surround but inside had space
        return {
            text,
            formats: existingFormats
        }
    } else {
        //Valid surrounds, check for more
        const combined = [existingFormats, potentialFormats].flat();
        return handleBoldItalics(t, combined);
    }

}

