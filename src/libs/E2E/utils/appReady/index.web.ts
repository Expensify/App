// When `window.onload` is emitted it means that web page has been loaded
const appReady = new Promise<void>((resolve) => {
    window.onload = () => {
        resolve();
    };
});

export default appReady;
