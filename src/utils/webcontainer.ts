import {FileType, Uri, workspace} from "vscode";

export const transformToWebcontainerFiles = async (dir: Uri, files: any = {}) => {
    for (const [name, type] of await workspace.fs.readDirectory(dir)) {
        if (type === FileType.File) {
            const filePath = Uri.joinPath(dir, name);
            // TODO add exclude functionality
            const readData = await workspace.fs.readFile(filePath);
            const value = new TextDecoder().decode(readData);
            files[name] = {
                file: {
                    contents: value,
                },
            };
        }
        if (type === FileType.Directory) {
            files[name] = {
                directory: {},
            };
            await transformToWebcontainerFiles(Uri.joinPath(dir, name), files[name].directory);
        }
    }
    return files;
};

export const getSmartContractItems = async (dir: Uri, items = []) => {
    for (const [name, type] of await workspace.fs.readDirectory(dir)) {
        if (type === FileType.File) {
            const filePath = Uri.joinPath(dir, name);
            // TODO add exclude functionality
            const readData = await workspace.fs.readFile(filePath);
            const value = new TextDecoder().decode(readData);
            const foundItems = [...value.matchAll(/class (\w*) extends SmartContract/gi)];
            const newItems = foundItems.map(item => ({value: name, name: item[1]}))
            items.push(...newItems)
        }
        if (type === FileType.Directory) {
            await getSmartContractItems(Uri.joinPath(dir, name), items);
        }
    }
    return items;
};
