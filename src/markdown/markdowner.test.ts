import { markdownParser, markdownToTerminal } from '../markdown/markdowner.ts';


const md = Deno.readTextFileSync('./src/markdown/markdown.test.md');


if(false){
    const markedDown = markdownToTerminal(md);
    console.log('');
    console.log(markedDown);
}



if(true){
    const parser = new markdownParser();
    //const text = Deno.readTextFileSync('simplemd.test.md');
    const text = '### Hello, this is some markdown **Hello**';
    const tokens = parser.tokenizeLine(text);
    
    console.log('TOKENS BELOW')
    console.log(tokens);
    
    
    
    const symbols = parser.symbolizeTokens(tokens);
    const strings = symbols.map((s) => {
        return `[${s.type}, ${s.value || s.stength || ''}]`;
    });

    console.log('SYMBOLS BELOW')
    console.log(strings);


    const finalOutput = parser.renderSymbols(symbols);

    console.log(finalOutput);
    
}