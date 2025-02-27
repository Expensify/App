import CONST from '@src/CONST';

/**
 * Tokenized search utility function
 * @param items - Array of items to search through
 * @param searchValue - The search term
 * @param getTextTokens - A function that returns an array of text tokens for each item
 * @returns Filtered array of items that match the search term
 */
export default function tokenizedSearch<T>(items: T[], searchValue: string, getTextTokens: (item: T) => string[]): T[] {
    if (!searchValue.trim()) {
        return items;
    }

    const searchTokens = searchValue.trim().toLowerCase().split(CONST.REGEX.WHITESPACE);

    return items.filter((item) => {
        const textTokens = getTextTokens(item)
            .map((token) => token.toLowerCase().split(CONST.REGEX.WHITESPACE))
            .flat();

        return searchTokens.every((searchToken) => textTokens.some((textToken) => textToken.includes(searchToken)));
    });
}
