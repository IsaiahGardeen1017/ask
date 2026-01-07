import { freemem } from 'node:os';
import { askGeminiWithRetry, VOICE_PROMPT } from './askGemini.ts';
import { markdownToTerminal } from './markdowner.ts';
import { say } from './say.ts';
import { VoiceStyle } from './supertonic/helper.ts';
import { VoiceOptions } from './supertonic/textToSpeech.ts';

const chaos = true;

const query = 'Tell a one paragraph story about some chickens';
const voices: VoiceOptions[] = ['M1'];

const wavs = [];

for(let i = 0; i < voices.length; i++){
    const startTime = Date.now();
    const response = await askGeminiWithRetry(query, VOICE_PROMPT);
    const sayProm = say(response, voices[i], 3, true, true);
    const timeDiff = (Date.now() - startTime)/1000;
    console.log(`${voices[i]} took ${timeDiff} secs to say`);
    if(!chaos){
        await sayProm;
    }
}