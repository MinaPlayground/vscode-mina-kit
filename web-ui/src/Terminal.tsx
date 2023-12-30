import 'xterm/css/xterm.css';
import {useEffect, useRef, useState} from 'react'
import {WebContainer} from "@webcontainer/api";
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit';
import {useSetAtom} from "jotai";
import {initializingFinishedAtom} from "./App";

const WebContainerTerminal = ({vscode}) => {
    const webcontainerInstance = useRef<any>();
    const setInitializingFinished = useSetAtom(initializingFinishedAtom)
    const [isInitializing, setIsInitializing] = useState(true)

    const reloadFiles = async (files) => {
        await webcontainerInstance.current.mount(files);
    }

    useEffect(() => {
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateFile':
                    webcontainerInstance.current.fs.writeFile(message.path, message.value)
                    break;
                case 'loadFiles':
                    (async () => {
                        const terminalEl = document.querySelector('.terminal');
                        const terminal = new Terminal({
                            convertEol: true,
                        });
                        const fitAddon = new FitAddon();
                        terminal.loadAddon(fitAddon);
                        terminal.open(terminalEl as HTMLElement);
                        fitAddon.fit();
                        webcontainerInstance.current = await WebContainer.boot();
                        const bootFiles = message.files
                        await webcontainerInstance.current.mount(bootFiles);

                        webcontainerInstance.current.on("server-ready", (port, url) => {
                            vscode.postMessage({command: 'preview', text: url})
                        });

                        const shellProcess = await webcontainerInstance.current.spawn('jsh');

                        const xtermResizeOb = new ResizeObserver(function (entries) {
                            fitAddon.fit();
                            shellProcess.resize({
                                cols: terminal.cols,
                                rows: terminal.rows,
                            });
                        });

                        xtermResizeOb.observe(terminalEl);

                        shellProcess.output.pipeTo(
                            new WritableStream({
                                write(data) {
                                    terminal.write(data);
                                },
                            })
                        );

                        const input = shellProcess.input.getWriter();
                        terminal.onData((data) => {
                            input.write(data);
                        });
                        setIsInitializing(false);
                        setInitializingFinished(true);
                    })();
                    break;
                case 'reloadFiles':
                    void reloadFiles(message.files);
                    break;
            }
        });
        vscode.postMessage({command: 'initialize'})
    }, []);

    return (
        <>
            <div className="flex flex-col flex-1">
                {isInitializing && <h1 className="text-lg py-2 text-white">Initializing terminal...</h1>}
                <div className="terminal bg-black flex-1"/>
            </div>
        </>
    );
}

export default WebContainerTerminal
