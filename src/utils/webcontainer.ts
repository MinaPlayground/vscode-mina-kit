import {FileType, Uri, workspace} from "vscode";

export const transformToWebcontainerFiles = async (dir: Uri, files: any = {}) => {
    for (const [name, type] of await workspace.fs.readDirectory(dir)) {
        if (type === FileType.File) {
            const filePath = Uri.joinPath(dir, name);
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
