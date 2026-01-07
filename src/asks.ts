import { askGeminiWithRetry, VOICE_PROMPT } from './askGemini.ts';
import { markdownToTerminal } from './markdowner.ts';
import { say } from './say.ts';
import { VoiceOptions } from './supertonic/textToSpeech.ts';

const query = Deno.args.join(' ');


const response = await askGeminiWithRetry(query, VOICE_PROMPT);

const voice = `${Math.random() > 0.5 ? 'M' : 'F'}${Math.random() > 0.5 ? '1' : '2'}` as VoiceOptions;

say(response, voice, 5);

const markedDownResp = markdownToTerminal(response);
console.log(markedDownResp);