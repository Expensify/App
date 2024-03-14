import type {Browser} from 'playwright';

let browser: Browser | null = null;

const setBrowser = (instance: Browser | null) => {
    browser = instance;
};

const getBrowser = () => browser;

export {setBrowser, getBrowser};
