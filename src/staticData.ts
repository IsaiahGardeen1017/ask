export type Configuration = {
    apiKey?: string,
    logQuerires: boolean
}

export function defaultConfig(): Configuration {
    return {
        logQuerires: true
    }
}

export type HistoryItem = {
    timestamp: number,
    query: string,
    response: string
}
export type HistoryData = {
    history: HistoryItem[];
}


export async function getConfiguration(path: string): Promise<Configuration> {
    return await getFile(path, defaultConfig);
}

export async function getFile(path: string, defaultData: () => any): Promise<any> {
    let data: Configuration;
    try {
        return await JSON.parse(Deno.readTextFileSync(path));
    } catch (err) {
        data = defaultData();
        try {
            await Deno.writeTextFileSync(path, JSON.stringify(data));
            return data;
        } catch (err) {
            throw `could not read or write file: ${path}`;
        }
    }
}

export async function writeConfigFile(path: string, data: any) {
    try {
        await Deno.writeTextFileSync(path, JSON.stringify(data));
    } catch (err) {
        throw `could not write file: ${path}`;
    }
}


export function emptyHistory(): HistoryData {
    return { history: [] };
}

export async function readHistory(path: string): Promise<HistoryData> {
    return await getFile(path, emptyHistory) as HistoryData;
}

export async function setHistory(path: string, data: HistoryData = emptyHistory()) {
    await writeConfigFile(path, data);
}