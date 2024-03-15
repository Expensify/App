import {performance} from 'isomorphic-performance';

performance.mark('start:nativeLaunch');

// When `window.onload` is emitted it means that web page has been loaded
const appReady = new Promise<void>((resolve) => {
    window.onload = () => {
        performance.mark('end:nativeLaunch');
        performance.measure('nativeLaunch', 'start:nativeLaunch', 'end:nativeLaunch');
        resolve();
    };
});

export default appReady;
