import {Uri, ViewColumn, Webview, WebviewPanel, window, Disposable, workspace, FileType, commands} from "vscode";
import {PreviewPanel} from "./PreviewPanel";
import {getSmartContractItems, transformToWebcontainerFiles} from "../../utils/webcontainer";

export function getWebviewOptions(extensionUri: Uri) {
    return {
        // Enable javascript in the webview
        enableScripts: true,
        retainContextWhenHidden: true,
        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [Uri.joinPath(extensionUri, 'out'),
            Uri.joinPath(extensionUri, 'web-ui/build')]
    };
}

/**
 * Manages webcontainer webview panels
 */
export class WebcontainerPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: WebcontainerPanel | undefined;

    public static readonly viewType = 'webcontainer';

    private readonly _panel: WebviewPanel;
    private readonly _extensionUri: Uri;
    private _disposables: Disposable[] = [];

    public static createOrShow(extensionUri: Uri, previewPanel: PreviewPanel) {
        const column = window.activeTextEditor
            ? window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (WebcontainerPanel.currentPanel) {
            WebcontainerPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = window.createWebviewPanel(
            WebcontainerPanel.viewType,
            'Terminal',
            column || ViewColumn.One,
            getWebviewOptions(extensionUri),
        );

        WebcontainerPanel.currentPanel = new WebcontainerPanel(panel, extensionUri, previewPanel);
    }

    public static revive(panel: WebviewPanel, extensionUri: Uri, preview: any) {
        WebcontainerPanel.currentPanel = new WebcontainerPanel(panel, extensionUri, preview);
    }

    private constructor(panel: WebviewPanel, extensionUri: Uri, previewPanel: any) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview(
            this._panel.webview
        );
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);


        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'preview':
                        previewPanel.createOrShow(this._extensionUri);
                        previewPanel.send(message.text);
                        break;
                    case 'initialize':
                        void this.initalize();
                        break;
                    case 'reloadFiles':
                        void this.reloadFiles();
                        break;
                    case 'findSmartContracts':
                        void this.findSmartContracts();
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public async initalize() {
        workspace.onDidChangeTextDocument(
            async (event) => {
                const uri = event.document.uri;
                const folder = workspace.getWorkspaceFolder(uri);
                const path = uri.path.replace(folder?.uri.path ?? '', '');
                const readData = await workspace.fs.readFile(uri);
                const value = new TextDecoder().decode(readData);
                this._panel.webview.postMessage({command: 'updateFile', path, value});
            },
            null,
            this._disposables
        );

        const folder = workspace.workspaceFolders?.[0];
        if (!folder) {
            return;
        }

        const files = await transformToWebcontainerFiles(folder.uri);
        this._panel.webview.postMessage({command: 'loadFiles', files});
    }

    public async reloadFiles() {
        const folder = workspace.workspaceFolders?.[0];
        if (!folder) {
            return;
        }

        const files = await transformToWebcontainerFiles(folder.uri);
        this._panel.webview.postMessage({command: 'reloadFiles', files});
    }

    public async findSmartContracts() {
        const folder = workspace.workspaceFolders?.[0];
        if (!folder) {
            return;
        }

        const items = await getSmartContractItems(folder.uri);
        this._panel.webview.postMessage({command: 'findSmartContracts', items});
    }


    public dispose() {
        WebcontainerPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: Webview) {
        // Local path to main script run in the webview
        const scriptPath = Uri.joinPath(this._extensionUri, 'web-ui', 'dist', 'assets', 'index.js');

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPath);

        // Local path to css styles
        const styletPath = Uri.joinPath(this._extensionUri, 'web-ui', 'dist', 'assets', 'index.css');

        // Uri to load styles into webview
        const stylesUri = webview.asWebviewUri(styletPath);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src https://stackblitz.com/ *.webcontainer.io/; style-src ${webview.cspSource} 'self' 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}' https://stackblitz.com/ *.webcontainer.io/;">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesUri}" rel="stylesheet">
				<title>Terminal</title>
			</head>
			<body>
			<div id="root"></div>
			<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
