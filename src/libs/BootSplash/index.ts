import Log from '@libs/Log';

function resolveAfter(delay: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
    });
}

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);

    return document.fonts.ready.then(() => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.opacity = '0';
        }

        return resolveAfter(250).then(() => {
            if (!splash?.parentNode) {
                return;
            }
            splash.parentNode.removeChild(splash);
        });
    });
}

export default {
    hide,
    logoSizeRatio: 1,
    navigationBarHeight: 0,
};
