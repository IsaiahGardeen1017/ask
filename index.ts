import { askGemini, askGeminiWithRetry } from "./src/askGemini.ts";
import { markdownToTerminal } from "./src/markdowner.ts";



const args = Deno.args;


const query = args[0].includes(' ') ? args[0] : args.join(' ');

console.log(query);

const response = await askGeminiWithRetry(query);
const markedDownResp = markdownToTerminal(response);

console.log();
console.log(markedDownResp);
