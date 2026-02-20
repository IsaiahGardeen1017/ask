export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type OneOrMany<T> = T | T[];