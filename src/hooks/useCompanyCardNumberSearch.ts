import {clearCompanyCardNumberSearch, searchCompanyCardByNumber} from '@libs/actions/CompanyCards';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import {useEffect, useMemo} from 'react';

import useDebouncedState from './useDebouncedState';
import useOnyx from './useOnyx';

const CARD_NUMBER_REGEX = /^\d{13,19}$/;

function normalizeCardNumber(value: string): string {
    return value.replaceAll(/[\s-]/g, '');
}

type UseCompanyCardNumberSearch = {
    /** Feed the current search string into the hook; it is debounced and stripped internally */
    setSearchValue: (value: string) => void;

    /** cardIDs of assigned cards matching the typed number on this feed */
    matchedCardIDs: Set<number>;

    /** encryptedCardNumbers of unassigned cards matching the typed number on this feed */
    matchedEncryptedNumbers: Set<string>;

    /** cardIDs that matched on partial digits only (another card could share them) */
    lastFourCardIDs: Set<number>;

    /** encryptedCardNumbers that matched on partial digits only */
    lastFourEncryptedNumbers: Set<string>;

    /** The normalized number the current results belong to, or undefined when none apply */
    resultsQuery: string | undefined;

    /** Whether a full-number search is in flight (used to avoid a flash of "No results") */
    isSearching: boolean;
};

/**
 * Drives the server-side company-card full-number search behind the Company Cards search box. The masked
 * card name can never match a full number, so a 13-19 digit query is sent to SearchCompanyCardByNumber and
 * the returned cards are matched by cardID (assigned) or encryptedCardNumber (unassigned). Results are
 * scoped to the given feed and belong to the exact number typed, so a stale response never leaks in.
 */
function useCompanyCardNumberSearch(policyID: string | undefined, feed: CompanyCardFeedWithNumber | undefined, domainAccountID: number | undefined): UseCompanyCardNumberSearch {
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [searchResult] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARD_NUMBER_SEARCH}${policyID}`, {canBeMissing: true});

    const immediateNormalized = normalizeCardNumber(searchValue);
    const debouncedNormalized = normalizeCardNumber(debouncedSearchValue);
    // The immediate value drives the loading UI so the spinner shows the moment the number is eligible; the
    // debounced value drives the API call so it is not fired on every keystroke.
    const isEligibleQuery = CARD_NUMBER_REGEX.test(immediateNormalized);
    const isFullNumberQuery = CARD_NUMBER_REGEX.test(debouncedNormalized);

    useEffect(() => {
        if (!policyID) {
            return;
        }
        // Clearing the input drops any stale results so a later re-type does not briefly show the old match.
        if (!searchValue) {
            clearCompanyCardNumberSearch(policyID);
            return;
        }
        if (!isFullNumberQuery || !feed || !domainAccountID) {
            return;
        }
        searchCompanyCardByNumber(policyID, debouncedNormalized, feed, domainAccountID);
    }, [policyID, feed, domainAccountID, isFullNumberQuery, debouncedNormalized, searchValue]);

    useEffect(
        () => () => {
            if (!policyID) {
                return;
            }
            clearCompanyCardNumberSearch(policyID);
        },
        [policyID],
    );

    return useMemo(() => {
        // Results count only when they belong to the number currently typed. Compare against the immediate
        // value, not the debounced one, so stale results clear the moment the user edits the input instead
        // of lingering until the next debounce tick.
        // Treat stale cards as "no match" while a new request is in flight so an in-progress result never
        // leaks into the list for a different query.
        const resultsMatchQuery = isEligibleQuery && searchResult?.query === immediateNormalized && searchResult?.isLoading !== true;
        const relevantCards = resultsMatchQuery
            ? (searchResult?.cards ?? []).filter((card) => card.feed.toLowerCase() === String(feed).toLowerCase() && (!domainAccountID || card.domainAccountID === domainAccountID))
            : [];

        const matchedCardIDs = new Set<number>();
        const matchedEncryptedNumbers = new Set<string>();
        const lastFourCardIDs = new Set<number>();
        const lastFourEncryptedNumbers = new Set<string>();
        for (const card of relevantCards) {
            if (card.cardID !== undefined) {
                matchedCardIDs.add(card.cardID);
                if (card.matchType === 'lastFour') {
                    lastFourCardIDs.add(card.cardID);
                }
            }
            if (card.encryptedCardNumber) {
                matchedEncryptedNumbers.add(card.encryptedCardNumber);
                if (card.matchType === 'lastFour') {
                    lastFourEncryptedNumbers.add(card.encryptedCardNumber);
                }
            }
        }

        // Loading runs from the first eligible keystroke until the results for the number currently typed land.
        const resultsReadyForCurrentInput = searchResult?.query === immediateNormalized && searchResult?.isLoading !== true;

        return {
            setSearchValue,
            matchedCardIDs,
            matchedEncryptedNumbers,
            lastFourCardIDs,
            lastFourEncryptedNumbers,
            resultsQuery: resultsMatchQuery ? immediateNormalized : undefined,
            isSearching: isEligibleQuery && !resultsReadyForCurrentInput,
        };
    }, [
        isFullNumberQuery,
        debouncedNormalized,
        immediateNormalized,
        isEligibleQuery,
        searchResult?.query,
        searchResult?.cards,
        searchResult?.isLoading,
        feed,
        domainAccountID,
        setSearchValue,
    ]);
}

export default useCompanyCardNumberSearch;
export {normalizeCardNumber, CARD_NUMBER_REGEX};
