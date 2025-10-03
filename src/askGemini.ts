import { randomPeriods } from "./terminalFormatting.ts";

const GEMINI_API_KEY = '';

function randomPersonality(): string {
    const personalities = [
        'You are an alien from space'
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
}

const maxTries = 5;
export async function askGeminiWithRetry(query: string, allowPrintOutput = true): Promise<string> {
    const startTime = Date.now();
    const loadingBarLength = 50;
    let num503s = 0;


    const process = async () => {
        let numTries = 0;
        while (numTries < maxTries) {
            numTries++;
            try {
                const response = await askGemini(query);
                return response;
            } catch (err) {
                if (err instanceof Gemini503Error) {
                    num503s++;
                } else {
                    console.log('FATAL ERROR');
                    console.error(err);
                }
            }
        }
        return 'Gemini servers are cooked ngl'
    };




    const resp = process();
    let loading = true;
    const interval = setInterval(() => {
        if (allowPrintOutput && loading) {
            Deno.stdout.writeSync(new TextEncoder().encode(`\r${randomPeriods(loadingBarLength)}`));
        }
    }, 50);

    return resp.then((val) => {
        loading = false;
        clearInterval(interval);
        const timeDiff = Date.now() - startTime;
        if (allowPrintOutput) {
            console.log(`\r${''}`.padEnd(loadingBarLength + 1, ' '));
        }
        //Time diff console.log(`\r${timeDiff}ms    ${''.padEnd(num503s, '.')}`.padEnd(loadingBarLength + 1, ' '));
        return val
    });
}

export async function askGemini(query: string): Promise<string> {
    const API_KEY = GEMINI_API_KEY;
    const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{
                    text: `
                    You're Role: You are being used in a cli tool for simple queries a developer may have when in the terminal, for this reason do not give overly long answers. 
                    Use judgment, If the user is asking for simple commands give them the command with maybe one line of explanation
                    Some answers may need a long answer and explanation and that is fine.
                    `
                }]
            },
            contents: [{
                parts: [{ text: query }],
            }],
            generationConfig: {
                thinkingConfig: {
                    thinkingBudget: 0
                }
            }
        }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        if (response.status === 503) {
            throw new Gemini503Error(
                `Gemini API error: ${response.status} - ${JSON.stringify(errorBody)}`,
            )
        }
        throw new Error(
            `Gemini API error: ${response.status} - ${JSON.stringify(errorBody)}`,
        );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof candidate === "string") {
        return candidate;
    } else {
        throw new Error("No valid response from Gemini API.");
    }
}

class Gemini503Error extends Error {
}