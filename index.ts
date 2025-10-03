import { askGeminiImage, askGeminiWithRetry } from "./src/askGemini.ts";
import { markdownToTerminal } from "./src/markdowner.ts";



let args = Deno.args;


let query: string;
let image = false;

if(args[0] === '-i'){
    image = true;
    args.shift();
}

if(args[0].includes(' ')){
    query = args[0];
}else{
    query = args.join(' ');
}



console.log(query);

if(image){
    console.log('IMAGING');
    const response = await askGeminiImage(query);
    console.log(response);
}else{
    const response = await askGeminiWithRetry(query);
    const markedDownResp = markdownToTerminal(response);
    
    console.log();
    console.log(markedDownResp);
}



