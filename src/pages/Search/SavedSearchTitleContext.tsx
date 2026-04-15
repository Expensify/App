import React, {createContext, useContext} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/Session';

type SavedSearchTitleContextValue = {
    resolveTitle: (query: string) => string;
};

const SavedSearchTitleContext = createContext<SavedSearchTitleContextValue | undefined>(undefined);

/**
 * Subscribes to the heavy Onyx collections (reports, policies, cards, feeds, etc.)
 * needed for resolving saved search titles, and pre-computes shared derived data
 * (taxRates, mergedCards). Exposes a `resolveTitle` function that children and
 * sibling consumers can call to resolve a single query into a readable title.
 *
 * Mount this once in the parent so that expensive derivations run once rather
 * than per saved search tab item.
 */
function SavedSearchTitleDataProvider({children}: {children: React.ReactNode}) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const reportAttributes = useReportAttributes();

    const taxRates = getAllTaxRates(allPolicies);
    const cardsForSavedSearchDisplay = mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList);

    const resolveTitle = (query: string): string => {
        const queryJSON = buildSearchQueryJSON(query);
        if (!queryJSON) {
            return query;
        }
        return buildUserReadableQueryString({
            queryJSON,
            PersonalDetails: personalDetails,
            reports,
            taxRates,
            cardList: cardsForSavedSearchDisplay,
            cardFeeds: allFeeds,
            policies: allPolicies,
            currentUserAccountID,
            autoCompleteWithSpace: false,
            translate,
            feedKeysWithCards,
            reportAttributes,
        });
    };

    const value: SavedSearchTitleContextValue = {resolveTitle};

    return <SavedSearchTitleContext.Provider value={value}>{children}</SavedSearchTitleContext.Provider>;
}

function useSavedSearchTitleData(): SavedSearchTitleContextValue {
    const context = useContext(SavedSearchTitleContext);
    if (!context) {
        throw new Error('useSavedSearchTitleData must be used within SavedSearchTitleDataProvider');
    }
    return context;
}

export {SavedSearchTitleDataProvider, useSavedSearchTitleData};
