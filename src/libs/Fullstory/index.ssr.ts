class FSPage {
    update() {}

    start() {}

    end() {}
}

/**
 * Fullstory is a no-op in SSR
 */
const FS = {
    init: () => {},
    anonymize: () => {},
    consent: () => {},
    consentAndIdentify: () => {},
    fsIdentify: () => {},
};

function parseFSAttributes(): void {
    // pass
}

function getFSAttributes(): string {
    return '';
}

function getChatFSAttributes(): string[] {
    return ['', ''];
}

export default FS;
export {FSPage, parseFSAttributes, getFSAttributes, getChatFSAttributes};
