import * as OptionsListUtils from './OptionsListUtils';

/**
 * Tokenized search utility function
 * @param items - Array of items to search through
 * @param searchValue - The search term
 * @param getTextTokens - A function that returns an array of text tokens for each item
 * @param shouldNormalize - Whether to normalize the search value using getSearchValueForPhoneOrEmail
 * @returns Filtered array of items that match the search term
 */
export default function tokenizedSearch<T>(items: T[], searchValue: string, getTextTokens: (item: T) => string[], shouldNormalize = true): T[] {
    if (!searchValue.trim()) {
        return items;
    }

    const normalizedSearchValue = shouldNormalize ? OptionsListUtils.getSearchValueForPhoneOrEmail(searchValue) : searchValue;

    const searchTokens = normalizedSearchValue.trim().toLowerCase().split(/\s+/);

    return items.filter((item) => {
        const textTokens = getTextTokens(item)
            .map((token) => token.toLowerCase().split(/\s+/))
            .flat();

        return searchTokens.every((searchToken) => textTokens.some((textToken) => textToken.includes(searchToken)));
    });
}
