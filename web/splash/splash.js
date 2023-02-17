import './splash.css';
import newExpensifyLogo from 'logo?raw';
import themeColors from '../../src/styles/themes/default';

let areFontsReady = false;
document.fonts.ready.then(() => {
    areFontsReady = true;
});

document.addEventListener('DOMContentLoaded', () => {
    const minMilisecondsToWait = 1.5 * 1000;
    let passedMiliseconds = 0;
    let isRootMounted = false;
    const splash = document.getElementById('splash');
    const splashLogo = document.querySelector('.splash-logo');
    const root = document.getElementById('root');
    splash.style.backgroundColor = themeColors.appBG;

    // Set app background color for overflow scrolling
    const body = document.querySelector('body');
    body.style.backgroundColor = themeColors.appBG;

    splashLogo.innerHTML = newExpensifyLogo;

    const intervalId = setInterval(() => {
        passedMiliseconds += 250;
        isRootMounted = root.children.length > 0;
        if (passedMiliseconds >= minMilisecondsToWait && isRootMounted && areFontsReady) {
            splash.parentNode.removeChild(splash);
            clearInterval(intervalId);
        }
    }, 250);
}, false);

