// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import type {SearchOptionData} from './types';

type SearchMatchConfig = {
    /** Whether to use toLocaleLowerCase() instead of toLowerCase(), defaults to false */
    useLocaleLowerCase?: boolean;

    /**
     * Optional callback to transform the concatenated search terms before matching.
     * @param concatenatedSearchTerms - the joined terms string, already lowercased
     */
    transformSearchText?: (concatenatedSearchTerms: string) => string;
};

/**
 * Includes localized "You"/"Me" so the current user is findable
 * by those terms in any supported language.
 *
 * @returns Raw (not lowercased) terms: display text, login,
 * login with dots stripped before @, and translated "You"/"Me".
 */
function getCurrentUserSearchTerms(item: Partial<SearchOptionData>) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return [item.text ?? item.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? '', translateLocal('common.you'), translateLocal('common.me')];
}

/**
 * For the current user, delegates to getCurrentUserSearchTerms.
 * For others, includes display name and login with dots stripped
 * before @ (so "john.doe@" matches "johndoe@").
 *
 * @returns Raw (not lowercased) terms the person is searchable by.
 */
function getPersonalDetailSearchTerms(item: Partial<SearchOptionData>, currentUserAccountID: number) {
    if (item.accountID === currentUserAccountID) {
        return getCurrentUserSearchTerms(item);
    }
    return [item.participantsList?.[0]?.displayName ?? item.displayName ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

/**
 * Checks whether a personal detail option matches a single search term
 * by comparing against the option's searchable fields (displayName, login, etc.).
 *
 * Expects `searchTerm` to already be lowercased and trimmed.
 */
function doesPersonalDetailMatchSearchTerm(
    item: Partial<SearchOptionData>,
    currentUserAccountID: number,
    searchTerm: string,
    {useLocaleLowerCase = false, transformSearchText}: SearchMatchConfig = {},
): boolean {
    const terms = getPersonalDetailSearchTerms(item, currentUserAccountID).join(' ');
    let searchText = useLocaleLowerCase ? terms.toLocaleLowerCase() : terms.toLowerCase();

    if (transformSearchText) {
        searchText = transformSearchText(searchText);
    }

    return searchText.includes(searchTerm);
}

export {getCurrentUserSearchTerms, getPersonalDetailSearchTerms, doesPersonalDetailMatchSearchTerm};
export type {SearchMatchConfig};
