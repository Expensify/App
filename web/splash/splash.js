import './splash.css';

const minMilisecondsToWait = 1.5 * 1000;
let passedMiliseconds = 0;
let rootMounted = false;
const splash = document.getElementById('splash');
const root = document.getElementById('root');

const intervalId = setInterval(() => {
    passedMiliseconds += 250;
    rootMounted = root.children.length > 0;
    if (passedMiliseconds >= minMilisecondsToWait && rootMounted) {
        splash.parentNode.removeChild(splash);
        clearInterval(intervalId);
    }
}, 250);
