import { askGeminiWithRetry } from './askGemini.ts';
import { markdownToTerminal } from './markdowner.ts';

export async function convo() {
    console.log('What can I help you with?');

    let inputs = [];

    let stillGoing = true;
    let lastInput = ' ';
    while (stillGoing) {
        const input = prompt('');
        if (input === null) {
            stillGoing = false;
            return;
        }

        inputs.push(input);
        if (input === '' && lastInput === '') {
            stillGoing = false;
        }
        const lastChar = input.charAt(input.length - 1);
        if(lastChar === '?'){
            stillGoing = false;
        }
        lastInput = input;
    };

    const query = inputs.filter((item) => {
        return item
    }).join('\n');

    console.log(`\x1b[34m${query}\x1b[0m`)

    const resp = await askGeminiWithRetry(query, true);
    const markedDownResp = markdownToTerminal(resp);

    console.log();
    console.log(markedDownResp);

}