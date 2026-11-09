import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {SAVED_SEARCH_FALLBACK_ICON_NAME} from '@libs/SearchUIUtils';

import useSavedSearchIcons from '@pages/Search/hooks/useSavedSearchIcons';
import useSavedSearchTitles from '@pages/Search/hooks/useSavedSearchTitles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {accountIDSelector} from '@selectors/Session';

import type {FlatNavSavedSearchItem} from './types';

import FLAT_NAV from './FLAT_NAV';

/**
 * The saved searches of the Saved section, with their titles and icons resolved and sorted the way the Spend menu lists them. Resolving a
 * title reads a wide slice of Onyx, so `enabled` lets a consumer that is off screen skip it.
 */
function useFlatNavSavedSearchItems(enabled = true): FlatNavSavedSearchItem[] {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const reportAttributes = useReportAttributes();

    const savedSearchTitles = useSavedSearchTitles({
        savedSearches,
        PersonalDetails: personalDetails,
        reports,
        taxRates: getAllTaxRates(allPolicies),
        cardList: mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList),
        cardFeeds: allFeeds,
        policies: allPolicies,
        currentUserAccountID,
        translate,
        formatPhoneNumber,
        feedKeysWithCards,
        reportAttributes,
        bankAccountList,
        enabled,
    });
    const savedSearchIconNames = useSavedSearchIcons(savedSearches);

    return Object.entries(savedSearches ?? {})
        .map(([savedSearchID, item]): FlatNavSavedSearchItem => {
            return {
                type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
                key: savedSearchIDToSearchKey(savedSearchID),
                sectionID: FLAT_NAV.SECTION.SAVED,
                savedSearchID,
                name: item.name,
                title: item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name,
                query: item.query,
                iconName: savedSearchIconNames.get(item.query) ?? SAVED_SEARCH_FALLBACK_ICON_NAME,
                isDisabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
        })
        .sort((a, b) => localeCompare(a.title, b.title));
}

export default useFlatNavSavedSearchItems;
