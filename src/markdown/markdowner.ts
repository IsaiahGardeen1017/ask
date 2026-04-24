import { escapeText, termFmt, TerminalColors, TerminalFormatOptions } from '../terminalFormatting.ts';

const inlineCodeColor: TerminalColors = 'blue';
const inlineCodeBgColor: TerminalColors = 'black';

export type mdWord = {
	type: 'text';
	text: string;
	styles: TerminalFormatOptions[];
	color?: TerminalColors;
};

export function markdownToTerminal(markdownString: string): string {
	const parser = new markdownParser();

	const strippedMarkdown = markdownString.replace(/[\r]+/g, '');

	const lines = strippedMarkdown.split('\n');

	const outLines: string[] = [];
	lines.forEach((line) => {
		const outline = parser.parseLine(line);
		outLines.push(outline);
	});

	return outLines.join('\n');
}

class markdownParser {
	inCodeBlock = false;

	constructor() {}

	parseLine(text: string): string {
		const stringWords = text.replaceAll('\t', ' ').split(' ');
		const words: mdWord[] = stringWords.map((str) => {
			return {
				type: 'text',
				text: str,
				styles: [] as TerminalFormatOptions[],
			};
		});

		const headingTags = ['######', '#####', '####', '###', '##', '#'];
		if (headingTags.includes(words[0].text)) {
			// Heading
			const heading = words.shift()?.text || '';
			let color = getHeadingColor(heading);
			words.forEach((word) => word.color = color);
		}

		const formattedStrings: string[] = [];

		let lastColor: TerminalColors | undefined = undefined;
		let lastStyles: TerminalFormatOptions[] = [];
		let currentString = '';

		for (let i = 0; i < words.length; i++) {
			const currentWord = words[i];
			if (currentWord.color !== lastColor || arrayEquals(currentWord.styles, lastStyles)) {
				const formattedLastString = termFmt(currentString, lastColor, undefined, lastStyles);
				formattedStrings.push(formattedLastString);

				lastColor = currentWord.color;
				lastStyles = currentWord.styles;
				currentString = currentWord.text;
			} else {
				currentString += ` ${currentWord.text}`;
			}
		}

		const formattedLastString = termFmt(currentString, lastColor, undefined, lastStyles);
		formattedStrings.push(formattedLastString);

		return formattedStrings.join(' ');
	}
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
