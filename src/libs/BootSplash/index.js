import Log from '../Log';

function resolveAfter(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function hide() {
    Log.info('[BootSplash] hiding splash screen', false);

    return document.fonts.ready.then(() => {
        const splash = document.getElementById('splash');
        splash.style.opacity = 0;

        return resolveAfter(250).then(() => {
            splash.parentNode.removeChild(splash);
        });
    });
}

function getVisibilityStatus() {
    return Promise.resolve(document.getElementById('splash') ? 'visible' : 'hidden');
}

export default {
    hide,
    getVisibilityStatus,
    navigationBarHeight: 0,
};
