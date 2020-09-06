import fs from 'fs';

export const writeFile = async (path: string, data: string) => {
    return new Promise((accept, rej) => {
        fs.writeFile(path, data, (err) => {
            if (!err)
                accept();
            else rej(err)
        });
    });
}

export const writeJsonFile = async (path: string, data: any) => {
    await writeFile(path, JSON.stringify(data));
}

export const readFile = async (path: string): Promise<string> => {
    return new Promise((accept, rej) => {
        fs.readFile(path, (err, data) => {
            if (!err)
                accept(data.toString());
            else rej(err);
        })
    });
}

export const readJsonFile = async (path: string) => {
    const text = await readFile(path);
    return JSON.parse(text);
}