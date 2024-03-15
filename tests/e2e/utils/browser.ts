import type {Browser, BrowserContext, Page} from 'playwright';

type Instance = {
    browser: Browser | null;
    page: Page | null;
    context: BrowserContext | null;
};
type Browsers = Record<string, Instance>;

const browsers: Browsers = {};

const initIfNeeded = (id: string) => {
    if (browsers[id]) {
        return;
    }

    browsers[id] = {
        browser: null,
        page: null,
        context: null,
    };
};

const setBrowser = (instance: Browser | null, id: string) => {
    initIfNeeded(id);
    browsers[id].browser = instance;
};

const getBrowser = (id: string) => browsers[id]?.browser;

const setPage = (instance: Page | null, id: string) => {
    initIfNeeded(id);
    browsers[id].page = instance;
};

const getPage = (id: string) => browsers[id]?.page;

const setContext = (instance: BrowserContext | null, id: string) => {
    initIfNeeded(id);
    browsers[id].context = instance;
};

const getContext = (id: string) => browsers[id]?.context;

export {setBrowser, getBrowser, setPage, getPage, setContext, getContext};
