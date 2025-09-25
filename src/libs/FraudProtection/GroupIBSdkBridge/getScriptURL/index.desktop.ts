function getScriptURL(): string {
    // In desktop (file://) keep it relative to index.html
    return 'gib.js';
}

export default getScriptURL;
