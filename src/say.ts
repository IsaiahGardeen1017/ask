import { text } from 'node:stream/consumers';
import { askGeminiWithRetry } from './askGemini.ts';
import { SpeechToTextOptions, textToSpeech, VoiceOptions } from './supertonic/textToSpeech.ts';
import { VoiceStyle } from './supertonic/helper.ts';


const voices: VoiceOptions[] = ['M1', 'M2', 'F1', 'F2'];

/**
 * 
for(let i = 0; i < voices.length; i++){
  const voice = voices[i];
  const textToSay = await askGeminiWithRetry('Tell me about Apollo 11 and the Australian dish that transmitted TV');
  await say(textToSay,voice);
}
*/


export async function say(text: string, voice: VoiceOptions = 'M1', steps = 5, print = false, chorus = false) {
  const genWavFunc = chorus ? genWavFileForTextChrous : genWavFileForText;

  const speechChunks = text.split(/[.\n\r]/).filter((text) => {
    return text.trimEnd().length > 0;
  });


  let previousWavFile = genWavFunc(speechChunks[0], { voice, steps });
  for (let i = 1; i < speechChunks.length; i++) {
    const wavToplayLoc = await previousWavFile;
    const speechPromise = playWavFile(wavToplayLoc);
    if (print) {
      console.log(speechChunks[i - 1]);
    }
    previousWavFile = genWavFunc(speechChunks[i], { voice, steps });
    await speechPromise;
    Deno.remove(wavToplayLoc);
  }
  if (print) {
    console.log(speechChunks[speechChunks.length - 1]);
  }
  await playWavFile(await previousWavFile);
}


export async function genWavFileForText(text: string, opts?: SpeechToTextOptions) {
  const voice = opts?.voice || 'M1';
  const steps = opts?.steps || 3;
  const wavFilePath = await textToSpeech(text, { steps: steps, voice: voice });
  return wavFilePath;
}

export async function genWavFileForTextChrous(text: string, opts?: SpeechToTextOptions) {
  const steps = opts?.steps || 3;
  const allWavFileLocs = await Promise.all(voices.map(async (v) => {
    return await textToSpeech(text, { steps, voice: v });
  }));
 const finalFileLoc = `${allWavFileLocs[0].split('.')[0]}_combined.wav`;
  let inputArgs: string[] = [];
  allWavFileLocs.forEach((val) => {
    inputArgs.push('-i');
    inputArgs.push(`${val}`);
  });
  inputArgs.push('-filter_complex', '[0:a][1:a][2:a][3:a]amerge=inputs=4[aout]');
  inputArgs.push('-map', '[aout]', finalFileLoc);

  //\console.log('ffmpeg ' + inputArgs.map((s) => `"${s}"`).join(' '));

  const gommand = new Deno.Command("ffmpeg", {
    args: inputArgs,
  });
  const { code, stdout, stderr } = await gommand.output();

  allWavFileLocs.forEach((loc) => {
    Deno.remove(loc);
  });
  return finalFileLoc;
}

export async function playWavFile(fileLocation: string) {
  const gommand = new Deno.Command("ffplay", {
    args: [
      '-nodisp',
      '-autoexit',
      fileLocation
    ],
  });
  const { code, stdout, stderr } = await gommand.output();
}


export async function saySimple(text: string, voice?: string) {
  const gommand = new Deno.Command("espeak-ng", {
    args: !voice ? [
      text
    ] : [
      '-v', voice,
      text
    ],
  });
  const { code, stdout, stderr } = await gommand.output();
}