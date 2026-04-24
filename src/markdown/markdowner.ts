import { escapeText, termFmt, TerminalColors, TerminalFormatOptions } from '../terminalFormatting.ts';

const inlineCodeColor: TerminalColors = 'blue';
const inlineCodeBgColor: TerminalColors = 'black';


type mdSymbolTypes = 'Text' | 'Heading' | 'EffectStart' | 'EffectEnd' | 'InlineCode' | 'CodeBlockStart' | 'CodeBlockEnd' | 'CodeBlockLine' | 'CodeBlockLangTag' | 'NewLine';
export type mdSymbol = {
	value?: string,
	type: mdSymbolTypes
	stength?: number;
}

export function markdownToTerminal(markdownString: string): string {
	const parser = new markdownParser();

	const strippedMarkdown = markdownString.replace(/[\r]+/g, '');

	const lines = strippedMarkdown.split('\n');

	const outLines: string[] = [];
	lines.forEach((line) => {
		const outline = parser.parseLine(line);
		if (outline !== false) {
			outLines.push(outline);
		}
	});

	return outLines.join('\n');
}

export class markdownParser {
	inCodeBlock: boolean;
	inParagraph: boolean;
	inList: boolean;
	codeBlockStartingTag: undefined | string;

	constructor() {
		this.inCodeBlock = false;
		this.inParagraph = true;
		this.inList = false;
	}

	/**
	 * 
	 * @param incomingText 
	 * @returns false if nothing should be printed (Differnet than empty string, which should be printed on its own line)
	 */
	parseLine(incomingText: string): string | false {
		//First we sanatize the incoming line
		const text = sanatizeIncomingString(incomingText);

		//If an empty line then do empty line things
		if (!this.inCodeBlock && text.replaceAll(' ', '') === '') {
			this.inParagraph = false;
			return false;
		}


		const tokens = this.tokenizeLine(text);
		const symbols = this.symbolizeTokens(tokens);

		console.log(`LINE: ${text}, ][][ Tokens: ${tokens.length}`);
		return tokens.map((t) => {
			return t.replaceAll(' ', '∎');
		}).join(' | ');
	}

	tokenizeLine(text: string): string[] {
		//Get all the symbols from the text
		const tokens: string[] = [];

		const chars = text.split('');

		let currentChunk: string = '';
		let chunkType = '';
		const chunkTypes = [' ', '`', '*', '>', '~'];



		for (let i = 0; i < chars.length; i++) {
			const cChar = chars[i];
			if (chunkTypes.includes(cChar)) {
				// Special Symbol
				if (cChar === chunkType) {
					// Add to current chunk
					currentChunk += cChar;
				} else {
					//Start new chunk
					tokens.push(currentChunk);
					currentChunk = cChar;
					chunkType = cChar;
				}
			} else {
				//Regular Text
				if (chunkType) {
					//Start new chunk
					tokens.push(currentChunk);
					currentChunk = cChar;
					chunkType = '';
				} else {
					//Add on to chunk
					currentChunk += cChar;
				}
			}
		}
		tokens.push(currentChunk);

		return tokens.filter(t => t);
	}

	symbolizeTokens(tokens: string[]): mdSymbol[] {
		const symbols: mdSymbol[] = [];

		if (isOnly(tokens[0], ' ') && tokens[0].length >= 4 && !this.inList) {
			//If first token is 4 spaces or more we one line code block
			symbols.push({
				type: 'CodeBlockStart',
			})
			symbols.push({
				type: 'CodeBlockLine',
				value: tokens.join('').substring(4)
			});
			this.inCodeBlock = true;
			this.codeBlockStartingTag = '    ';
			return symbols;
		} else {
			return simplifyTokens(tokens);
		}
	}
}


function simplifyTokens(tokens: string[]): mdSymbol[] {
	if(tokens.length === 0){
		return [];
	}

	if (isOnly(tokens[0], ' ')) {
		//First token is just spaces, get rid of it
		return simplifyTokens(tokens.splice(1));
	}

	const firstTokenLooksLikeHeader = isOnly(tokens[0], '#') && tokens[0].length < 7;
	const secondTokenIsSpaces = tokens.length > 1 && isOnly(tokens[1], ' ');
	if (firstTokenLooksLikeHeader && secondTokenIsSpaces) {
		// Header symbol
		return [{ type: 'Heading', stength: tokens[0].length }, ...simplifyTokens(tokens.splice(2)), { type: 'NewLine' }];
	}

	//Attempt to find a pair and reduce
	const isBIS = (s: string) => {
		return isOnly(s, '*') || isOnly(s, '~');
	}
	let startIndex;
	let startValue;
	let endIndex;
	for (let i = 0; i < tokens.length; i++) {
		//Found start, looking for end
		if(startIndex && !endIndex){
			if(isBIS(tokens[i]) && !isOnly(tokens[i - 1], ' ') && tokens[i] === startValue){
				endIndex = i;
			}
		}
		//Looking for start
		if (!startIndex && (i + 1 < tokens.length)) {
			if (isBIS(tokens[i]) && !isOnly(tokens[i + 1], ' ')) {
				startValue = tokens[i];
				startIndex = i;
			}
		}
	}
	if(startIndex && endIndex){
		return [
			...(startIndex === 0 ? [] : simplifyTokens(tokens.slice(0, startIndex - 1))),
			{type: 'EffectStart', value: startValue},
			...simplifyTokens(tokens.slice(startIndex + 1, endIndex)),
			{type: 'EffectEnd', value: startValue},
			...(endIndex === tokens.length - 1 ? [] : simplifyTokens(tokens.slice(endIndex + 1))),
		]
	}

	//Assume everthinf else is text but warn if not while in development
	const isTextual = (s: string) => {
		return !isOnly(s, '*') && !isOnly(s, '~') && !isOnly(s, '`') && !isOnly(s, '>');
	}

	if (tokens.every(t => isTextual(t))) {
		return [{
			type: 'Text',
			value: tokens.map((tok) => {
				if (isOnly(tok, ' ')) {
					return ' ';
				} else {
					return tok
				}
			}).join('')
		}]
	}
	return [];
}






export function arrayEquals(arr1: string[], arr2: string[]) {
	const arr2Copy = [...arr2];
	for (let i = 0; i < arr1.length; i++) {
		const idx = arr2Copy.indexOf(arr1[i]);
		if (idx === -1) {
			return false;
		}
		arr2Copy.splice(idx, 1);
	}
	if (arr2Copy.length !== 0) {
		return false;
	}
	return true;
}

function getHeadingColor(heading: string): TerminalColors {
	switch (heading) {
		case '######':
			return 'purple';
		case '#####':
			return 'blue';
		case '####':
			return 'green';
		case '###':
			return 'cyan';
		case '##':
			return 'yellow';
		case '#':
			return 'red';
		default:
			return 'default';
	}
}


function sanatizeIncomingString(str: string): string {
	return str.replaceAll('/t', '    ');
}


function isOnly(str: string, char: string): boolean {
	for (let i = 0; i < str.length; i++) {
		if (str[i] !== char) {
			return false;
		}
	}
	return true;
}