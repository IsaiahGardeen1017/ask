import { markdownToTerminal } from '../markdown/markdowner.ts';
import { markdownToTerminalOld } from '../markdown/markdownerOLD.ts';


const md = Deno.readTextFileSync('./markdown.test.md');

const markedDown = markdownToTerminal(md);
console.log('');
console.log(markedDown);