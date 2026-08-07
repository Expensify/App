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
import memoize, {equivalentArgsComparator} from '@libs/memoize';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import ListFilterWrapper from './ListFilterViewWrapper';

type UserSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    /** Whether this filter is the one the advanced filters popover currently shows */
    isActive?: boolean;
};

/** Maps each option's accountID onto `value` (what `moveInitialSelectionToTop` keys on) and pins the pre-selected rows to the top. */
const buildListData = (options: OptionData[], initialSelectedValues: string[]) =>
    moveInitialSelectionToTop(
        options.map((option) => ({...option, value: option.keyForList})),
        initialSelectedValues,
    );

const memoizedBuildListData = memoize(buildListData, {
    maxSize: 2,
    equality: equivalentArgsComparator,
    monitoringName: 'UserSelector.buildListData',
});

function UserSelector({value = [], isNegatable, selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, isActive = true, footer, onChange}: UserSelectorProps) {
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
        shouldKeepSelectedInAvailableOptions: true,
    });

    // Snapshot of the pre-selected accountIDs, refreshed whenever `isActive` flips so each popover visit pins the current
    // selection to the top without repinning rows toggled while it stays open (see https://github.com/Expensify/App/issues/61414).
    const [initialSelectedValues, setInitialSelectedValues] = useState(() => value);
    const [wasActive, setWasActive] = useState(isActive);
    if (wasActive !== isActive) {
        setWasActive(isActive);
        setInitialSelectedValues(value);
    }

    // The current user is excluded from personalDetails, so include it (when present) in the list. Pre-selected rows are moved to the
    // top, leaving the current user just below them in its natural sorted position.
    const baseListData = availableOptions.currentUserOption ? [availableOptions.currentUserOption, ...availableOptions.personalDetails] : availableOptions.personalDetails;
    const listData = memoizedBuildListData(baseListData, initialSelectedValues);

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
            isNegatable={isNegatable}
        >
            <SelectionList
                data={listData}
                textInputOptions={textInputOptions}
                canSelectMultiple
                ListItem={UserSelectionListItem}
                onSelectRow={selectUser}
                shouldUpdateFocusedIndex
                isLoadingNewOptions={isLoadingNewOptions}
                shouldShowLoadingPlaceholder={!areOptionsInitialized || !ready}
                style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                footerContent={footer}
            />
        </ListFilterWrapper>
    );
}

export default UserSelector;
