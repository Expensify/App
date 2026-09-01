import LoadingIndicator from '@components/LoadingIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

import ListFilterWrapper from './ListFilterViewWrapper';

type UserSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    /** The currently selected workspace filter, used to limit suggestions to those workspaces' members */
    policyID: Filter | undefined;
};

function UserSelector({value = [], isNegatable, policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: UserSelectorProps) {
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

    // getExpensifyTeamExclusions walks every personal detail, and it only narrows options that are not being built while
    // the selector stands as its own loading state, so it is skipped until then.
    const expensifyTeamExclusions = ready ? getExpensifyTeamExclusions(personalDetails, policies, currentUserPersonalDetails.email) : CONST.EMPTY_OBJECT;

    // Snapshot the pre-selected accountIDs from when the filter first opened so they can be floated to the
    // top on first render without repinning rows that are toggled afterwards.
    const initialSelectedValues = useInitialValue(() => value);

    // When the workspace filter is set, only suggest the members of the selected workspaces. Users that were already
    // selected when the filter opened are kept in the list even when they aren't members, so they can still be deselected here.
    const workspaceMemberLogins = (() => {
        if (!policyID?.value?.length) {
            return undefined;
        }

        const logins = new Set<string>();
        const selectedPolicies = getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY, policies);
        for (const policy of selectedPolicies) {
            if (policy.employeeList) {
                const employeeLogins = Object.keys(policy.employeeList);
                for (const login of employeeLogins) {
                    const employee = policy.employeeList[login];
                    if (employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(employee.errors)) {
                        continue;
                    }
                    logins.add(login);
                }
            }
            logins.add(policy.owner);
        }
        for (const accountID of initialSelectedValues) {
            const login = personalDetails?.[accountID]?.login;
            if (login) {
                logins.add(login);
            }
        }
        return logins.size ? logins : undefined;
    })();

    const {searchTerm, setSearchTerm, availableOptions, totalOptionsCount, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        initialSelected: initialSelectedAccountIDs,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        excludeFromSuggestionsOnly: expensifyTeamExclusions,
        includeLoginsOnly: workspaceMemberLogins,
        includeCurrentUser: false,
        includeRecentReports: false,
        shouldInitialize: ready,
        onSelectionChange: onChange,
        shouldKeepSelectedInAvailableOptions: true,
    });

    // The current user is excluded from personalDetails, so include it (when present) in the list. moveInitialSelectionToTop
    // keys on `value`, so map each option's accountID (keyForList) onto it. Pre-selected rows are moved to the top,
    // leaving the current user just below them in its natural sorted position.
    const baseListData = availableOptions.currentUserOption ? [availableOptions.currentUserOption, ...availableOptions.personalDetails] : availableOptions.personalDetails;
    const listData = moveInitialSelectionToTop(
        baseListData.map((option) => ({...option, value: option.keyForList})),
        initialSelectedValues,
    );

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
            // Held at the height a contact list occupies, so what arrives does not push the panel open under the cursor.
            shouldUseFixedPopoverHeight={!ready}
        >
            {ready ? (
                <SelectionList
                    data={listData}
                    textInputOptions={textInputOptions}
                    canSelectMultiple
                    ListItem={UserSelectionListItem}
                    onSelectRow={selectUser}
                    shouldUpdateFocusedIndex
                    isLoadingNewOptions={isLoadingNewOptions}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized}
                    style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                    footerContent={footer}
                />
            ) : (
                // One spinner while the contact list is not being built yet. A skeleton of rows would draw a list that
                // is not there and flicker row by row as the cursor moves from filter to filter.
                <LoadingIndicator />
            )}
        </ListFilterWrapper>
    );
}

export default UserSelector;
