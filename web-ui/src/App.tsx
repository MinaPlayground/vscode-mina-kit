import WebContainerTerminal from "./Terminal";
import {useEffect, useState} from "react";
import CTAModal from "./components/CTAModal";
import Select from "./components/Select";
import {atom, useAtom, useAtomValue} from "jotai";
import {WebContainer} from "@webcontainer/api";

interface VsCodeApi {
    postMessage(message: any): void;

    setState(state: any): void;

    getState(): any;
}

// const acquireVsCodeApi = () => {
//
// }

declare const acquireVsCodeApi: () => VsCodeApi;
const vscode = acquireVsCodeApi();

export const webcontainerAtom = atom<WebContainer | null>(null)
export const initializingFinishedAtom = atom<boolean>(false)

function App() {
    const initializingFinished = useAtomValue(initializingFinishedAtom)
    const webcontainer = useAtomValue(webcontainerAtom)

    useEffect(() => {
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'findSmartContracts':
                    console.log(message.items);
                    break;
            }
        });
        vscode.postMessage({command: 'findSmartContracts'})
    }, [])

    const onReload = () => {
        vscode.postMessage({command: 'reloadFiles'})
    }

    const deploySmartContract = async (path: string, feePayerKey: string) => {
        if (!webcontainer) return
        const process = await webcontainer.spawn("npm", [
            "run",
            "build",
        ]);
        await process?.exit;

        const deployProcess = await webcontainer.spawn("npx", [
            "--yes",
            "easy-mina-deploy",
            "deploy",
            "--path",
            path,
            "--className",
            "Add",
            "--feePayerKey",
            feePayerKey,
        ]);

        deployProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    console.log(data)
                    if (data.startsWith("{")) {
                    }
                },
            })
        );

        await deployProcess.exit;
    }
    return (
        <main>
            <section className="p-4">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-200 md:text-5xl lg:text-6xl">Mina
                    kit</h1>
                <p className="mb-8 text-lg font-normal text-gray-400 lg:text-xl">The All-in-One Mina Protocol extension
                    to run and deploy zkApps/Smart Contracts.</p>
                <div className="flex">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        {initializingFinished ? <button type="button" disabled={true}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-green-400 border border-gray-200 rounded-s-lg hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 me-2" viewBox="0 0 448 512">
                                <path opacity="1" fill="currentColor"
                                      d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                            </svg>
                            Terminal initialized
                        </button> : <button type="button"
                                            disabled={true}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-pink-500 to-orange-400  border border-gray-200 rounded-s-lg hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 me-2" viewBox="0 0 576 512">
                                <path opacity="1" fill="currentColor"
                                      d="M9.4 86.6C-3.1 74.1-3.1 53.9 9.4 41.4s32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 9.4 86.6zM256 416H544c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
                            </svg>
                            Initializing terminal...
                        </button>}

                        <button type="button"
                                onClick={() => (document.getElementById('deployModal') as HTMLFormElement).showModal()}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-pink-500 to-orange-400  border-t border-b border-gray-200 hover:text-black">
                            <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                 fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                                <path
                                    d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                            </svg>
                            Deploy Smart Contract
                        </button>
                        <button type="button"
                                onClick={onReload}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-pink-500 to-orange-400  border border-gray-200 rounded-e-lg hover:text-black">
                            <svg className="w-3 h-3 me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path opacity="1" fill="currentColor"
                                      d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/>
                            </svg>
                            Reload files
                        </button>
                    </div>

                </div>
            </section>
            <CTAModal title="Deploy Smart Contract" id="deployModal">
                <Select title="Select a Smart Contract"
                        items={[{value: '/test', name: 'Test'}, {value: '/test2', name: 'Test2'}]}
                        onChange={() => null}/>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Fill in your contracts path</span>
                    </div>
                    <input type="text" placeholder="e.g. contracts" className="input input-bordered w-full max-w-xs"/>
                </label>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">Close</button>
                    </form>
                </div>
            </CTAModal>
            <WebContainerTerminal vscode={vscode}/>
        </main>
    );
}

export default App
