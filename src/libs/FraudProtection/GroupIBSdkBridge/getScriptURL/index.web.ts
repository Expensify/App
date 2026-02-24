function getScriptURL(): string {
    // On web, load from the origin root so deep links like /r/123 don't request /r/123/gib.js
    return `${window.location.origin}/gib.js`;
}

export default getScriptURL;
