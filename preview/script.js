(function () {
    const iframeEl = document.querySelector('iframe');
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'preview':
                console.log(message.url);
                iframeEl.src = message.url;
                break;
            case 'loadFiles':
                break;
        }
    });
})();
