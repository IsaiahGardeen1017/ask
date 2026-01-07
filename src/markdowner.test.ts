import { markdownToTerminal } from './markdowner.ts';

const md = Deno.readTextFileSync('./markdown.test.md');

const markedDown = markdownToTerminal(md);
console.log('');
console.log(markedDown);