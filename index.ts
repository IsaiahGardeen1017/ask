import { askGeminiImage, askGeminiWithRetry } from "./src/askGemini.ts";
import { convo } from './src/conversationDriver.ts';
import { markdownToTerminal } from "./src/markdowner.ts";



let args = Deno.args;

let history: number = 0;

const queryParts: string[] = [];

args.reduce((prev, curr, idx) => {
    if(prev === '-h'){
        const historyInt = parseInt(curr);
        if(historyInt){
            history = historyInt;
        }else{
            history = 999;
            queryParts.push(curr);
        }
    }else{
        queryParts.push(curr);
    }
    return curr;
}, '');

let query = '';
if (queryParts.length === 0) {
    await convo();
} else {
    //Single query
    
    query = queryParts.join(' ');

    console.log(query);
    
    
    const response = await askGeminiWithRetry(query);
    const markedDownResp = markdownToTerminal(response);
    
    console.log();
    console.log(response);
}







