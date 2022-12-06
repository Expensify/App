import './splash.css';
import newExpensifyLogo from 'logo?raw';
import themeColors from '../../src/styles/themes/default';

document.addEventListener('DOMContentLoaded', () => {
    const minMilisecondsToWait = 1.5 * 1000;
    let passedMiliseconds = 0;
    let rootMounted = false;
    const splash = document.getElementById('splash');
    const splashLogo = document.querySelector('.splash-logo');
    const root = document.getElementById('root');
    splash.style.backgroundColor = themeColors.appBG;

    // // set app background color
    const body = document.getElementById('bg');
    body.style.backgroundColor = themeColors.appBG;

    splashLogo.innerHTML = newExpensifyLogo;

    const intervalId = setInterval(() => {
        passedMiliseconds += 250;
        rootMounted = root.children.length > 0;
        if (passedMiliseconds >= minMilisecondsToWait && rootMounted) {
            splash.parentNode.removeChild(splash);
            clearInterval(intervalId);
        }
    }, 250);
}, false);

