import CONST from '@src/CONST';

/**
 * Tokenized search utility function
 * @param items - Array of items to search through
 * @param searchValue - The search term
 * @param getTextTokens - A function that returns an array of text tokens for each item
 * @returns Filtered array of items that match the search term
 */
export default function tokenizedSearch<T>(items: T[], searchValue: string, getTextTokens: (item: T) => string[]): T[] {
    const trimmedSearch = searchValue.trim();
    if (!trimmedSearch) {
        return items;
    }

    const searchTokens = trimmedSearch.toLowerCase().split(CONST.REGEX.WHITESPACE).filter(Boolean);

    return items.filter((item) => {
        const normalizedTokens: string[] = [];

        for (const rawToken of getTextTokens(item)) {
            const lowerToken = rawToken.toLowerCase();
            for (const splitToken of lowerToken.split(CONST.REGEX.WHITESPACE)) {
                if (splitToken) {
                    normalizedTokens.push(splitToken);
                }
            }
        }

        for (const searchToken of searchTokens) {
            let matchFound = false;

            for (const textToken of normalizedTokens) {
                if (textToken.includes(searchToken)) {
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound) {
                return false;
            }
        }

        return true;
    });
}
