export default function decodeUnicode(str: string): string {
    return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => String.fromCharCode(parseInt(match.slice(2), 16)));
}
