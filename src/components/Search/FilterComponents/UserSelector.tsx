import React, {useState} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ListFilterWrapper from './ListFilterViewWrapper';

type UserSelectorProps = SearchFilterCommonProps<string[] | undefined>;

function UserSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: UserSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const shouldFocusInputOnScreenFocus = autoFocus && canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const initialSelectedAccountIDs = value.reduce<Set<string>>((acc, id) => {
        const participant = personalDetails?.[id];
        if (!participant) {
            return acc;
        }

        acc.add(id);
        return acc;
    }, new Set<string>());

    const expensifyTeamExclusions = getExpensifyTeamExclusions(personalDetails, policies, currentUserPersonalDetails.email);

    const {searchTerm, setSearchTerm, availableOptions, totalOptionsCount, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        initialSelected: initialSelectedAccountIDs,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        excludeFromSuggestionsOnly: expensifyTeamExclusions,
        includeUserToInvite: true,
        includeCurrentUser: false,
        includeRecentReports: false,
        shouldInitialize: ready,
        onSelectionChange: onChange,
        // Keep selected options inside personalDetails so a row stays in its sorted position when toggled,
        // instead of jumping to the top of the list (see https://github.com/Expensify/App/issues/61414).
        shouldKeepSelectedInAvailableOptions: true,
    });

    // Capture the accountIDs that were pre-selected when the filter first opened. Using this stable set
    // (not the live selection) keeps pre-selected rows pinned to the top on first render while rows stay in
    // place when toggled afterwards (see https://github.com/Expensify/App/issues/61414).
    const [initiallySelectedAccountIDs] = useState(() => new Set(value));

    // Split contacts into pre-selected rows (pinned to the top) and the rest, each keeping their natural
    // sorted order. Short lists are fully visible, so skip pinning for them (same threshold as the shared
    // moveInitialSelectionToTop util).
    const shouldPinSelectedRows = initiallySelectedAccountIDs.size > 0 && availableOptions.personalDetails.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD;
    const pinnedPersonalDetails: OptionData[] = [];
    const remainingPersonalDetails: OptionData[] = [];
    for (const option of availableOptions.personalDetails) {
        const isPinned = shouldPinSelectedRows && initiallySelectedAccountIDs.has(option.accountID.toString());
        (isPinned ? pinnedPersonalDetails : remainingPersonalDetails).push(option);
    }

    // Render order: pinned pre-selected rows → current user (excluded from personalDetails) → remaining contacts.
    const listData = availableOptions.currentUserOption
        ? [...pinnedPersonalDetails, availableOptions.currentUserOption, ...remainingPersonalDetails]
        : [...pinnedPersonalDetails, ...remainingPersonalDetails];

    const headerMessage = listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const selectUser = (option: OptionData) => {
        toggleSelection(option);
    };

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowSearchInput = totalOptionsCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const textInputOptions = shouldShowSearchInput
        ? {
              value: searchTerm,
              label: translate('selectionList.searchForSomeone'),
              onChangeText: setSearchTerm,
              headerMessage,
              disableAutoFocus: !shouldFocusInputOnScreenFocus,
              style: {
                  containerStyle: selectionListTextInputStyle,
              },
          }
        : undefined;

    return (
        <ListFilterWrapper
            itemCount={listData.length}
            isSearchable={shouldShowSearchInput}
        >
            <SelectionList
                data={listData}
                textInputOptions={textInputOptions}
                canSelectMultiple
                ListItem={UserSelectionListItem}
                onSelectRow={selectUser}
                isLoadingNewOptions={isLoadingNewOptions}
                shouldShowLoadingPlaceholder={!areOptionsInitialized || !ready}
                style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                footerContent={footer}
            />
        </ListFilterWrapper>
    );
}

export default UserSelector;
