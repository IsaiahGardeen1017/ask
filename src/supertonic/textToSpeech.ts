import { InferenceSession } from 'npm:onnxruntime-node';
import { loadTextToSpeech, loadVoiceStyle, TextToSpeech, timer, VoiceStyle, writeWavFile } from './helper.ts';

const ASSETS_PATH = 'src/supertonic/assets';
const OUTPUT_DIR = 'src/supertonic/assets/outdir';

const onnxDir = `${ASSETS_PATH}/onnx`;

export type VoiceOptions = 'F1' | 'F2' | 'M1' | 'M2';

export type SpeechToTextOptions = {
    steps?: number;
    voice?: VoiceOptions;
}

const useGPU = false;


let textToSpeechClass: TextToSpeech = await loadTextToSpeech(onnxDir, false);
let voiceStyles: {[K in VoiceOptions]?: VoiceStyle;} = {};


export async function textToSpeech(text: string, options?: SpeechToTextOptions): Promise<string> {
    const voice = options?.voice || 'M1';

    const totalStep = options?.steps || 4;
    const speed = 1.5;
    const voiceStylePaths = [`${ASSETS_PATH}/voice_styles/${voice}.json`];
    const textList = [text];
    const batch = false;

    if (voiceStylePaths.length !== textList.length) {
        throw new Error(
            `Number of voice styles (${voiceStylePaths.length}) must match number of texts (${textList.length})`,
        );
    }
    const bsz = voiceStylePaths.length;

    // --- 2. Load Text to Speech --- //
    if(!textToSpeechClass){
        console.log('Reloading textToSpeechClass');
        textToSpeechClass = await loadTextToSpeech(onnxDir, useGPU);
    }

    // --- 3. Load Voice Style --- //
    if(!voiceStyles[voice]){
        voiceStyles[voice] = loadVoiceStyle(voiceStylePaths, true);
    }
    const style = voiceStyles[voice];

    // --- 4. Synthesize speech --- //
    const { wav, duration } = await timer(
        "Generating speech from text",
        async () => {
            if (batch) {
                return await textToSpeechClass.batch(
                    textList,
                    style,
                    totalStep,
                    speed,
                );
            } else {
                return await textToSpeechClass.call(
                    textList[0],
                    style,
                    totalStep,
                    speed,
                );
            }
        },
    );

    try {
        await Deno.mkdirSync(OUTPUT_DIR);
    } catch (err) { }
    const wavShape = [bsz, wav.length / bsz];
    const outputPath = `${OUTPUT_DIR}/${crypto.randomUUID()}.wav`;
    for (let b = 0; b < bsz; b++) {
        const wavLen = Math.floor(textToSpeechClass.sampleRate * duration[b]);
        const wavOut = wav.slice(b * wavShape[1], b * wavShape[1] + wavLen);
        writeWavFile(outputPath, wavOut, textToSpeechClass.sampleRate);
    }

    return outputPath;

}