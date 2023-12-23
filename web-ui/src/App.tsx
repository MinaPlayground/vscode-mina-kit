function App() {
    return (
        <section>
            <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-200 md:text-5xl lg:text-6xl">Mina kit</h1>
                <p className="mb-8 text-lg font-normal text-gray-400 lg:text-xl sm:px-16 lg:px-48">The All-in-One Mina Protocol extension to run and deploy zkApps/Smart Contracts.</p>
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                    <a href="#"
                       className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 focus:ring-4 focus:ring-blue-300">
                        Initialize terminal
                        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </a>
                    <a href="#"
                       className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-gray-400 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-black focus:ring-4 focus:ring-gray-100">
                        Deploy Smart Contract
                    </a>
                </div>
            </div>
        </section>

    );
}

export default App
