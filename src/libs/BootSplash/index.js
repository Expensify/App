import Log from '../Log';

let areFontsReady = false;
document.fonts.ready.then(() => {
    areFontsReady = true;
});

function hide() {
    Log.info('[BootSplash] hiding splash screen', false);

    return new Promise((resolve) => {
        const minMilisecondsToWait = 1.5 * 1000;
        let passedMiliseconds = 0;
        let isRootMounted = false;
        const root = document.getElementById('root');
        const splash = document.getElementById('splash');

        const intervalId = setInterval(() => {
            passedMiliseconds += 250;
            isRootMounted = root.children.length > 0;
            if (passedMiliseconds >= minMilisecondsToWait && isRootMounted && areFontsReady) {
                clearInterval(intervalId);
                splash.style.opacity = 0;

                setTimeout(() => {
                    splash.parentNode.removeChild(splash);
                    resolve();
                }, 250);
            }
        }, 250);
    });
}

function getVisibilityStatus() {
    return document.getElementById('splash') ? 'visible' : 'hidden';
}

export default {
    hide,
    getVisibilityStatus,
    navigationBarHeight: 0,
};
