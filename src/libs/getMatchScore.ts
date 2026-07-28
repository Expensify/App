export default function getMatchScore(str: string, query: string): number {
    const lowerStr = str.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (lowerStr === lowerQuery) {
        return 3;
    }
    if (lowerStr.startsWith(lowerQuery)) {
        return 2;
    }
    if (lowerStr.includes(lowerQuery)) {
        return 1;
    }
    return 0;
}
