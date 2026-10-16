import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getUserToInviteOption} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {Str} from 'expensify-common';
import React from 'react';

import ListFilterWrapper from './ListFilterViewWrapper';

type UserSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    /** The currently selected workspace filter, used to limit suggestions to those workspaces' members */
    policyID: Filter | undefined;

    /** Whether a typed email that matches no suggestion can be selected, e.g. to filter by a member who was removed from the workspace */
    shouldAllowTypedEmail?: boolean;
};

function UserSelector({
    value = [],
    isNegatable,
    policyID,
    shouldAllowTypedEmail = false,
    selectionListTextInputStyle,
    selectionListStyle,
    autoFocus,
    ready = true,
    footer,
    onChange,
}: UserSelectorProps) {
    const styles = useThemeStyles();
    const shouldFooterBeInsideList = useShouldFooterBeInsideList();
    const {translate, formatPhoneNumber} = useLocalize();
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const shouldFocusInputOnScreenFocus = autoFocus && canFocusInputOnScreenFocus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Typed emails are stored as the email itself, so rebuild their options to keep them selected when the filter reopens.
    const initialTypedEmailOptions = useInitialValue(() => {
        if (!shouldAllowTypedEmail) {
            return [];
        }
        const options: OptionData[] = [];
        for (const id of value) {
            if (personalDetails?.[id] || !Str.isValidEmail(id)) {
                continue;
            }
            const option = getUserToInviteOption({searchValue: id, countryCode: CONST.DEFAULT_COUNTRY_CODE, formatPhoneNumber, loginList: undefined});
            if (option) {
                options.push({...option, isSelected: true});
            }
        }
        return options;
    });

    const initialSelectedAccountIDs = value.reduce<Set<string>>((acc, id) => {
        const participant = personalDetails?.[id];
        if (!participant) {
            return acc;
        }

        acc.add(id);
        return acc;
    }, new Set<string>());
    for (const option of initialTypedEmailOptions) {
        initialSelectedAccountIDs.add(option.accountID.toString());
    }

    // getExpensifyTeamExclusions walks every personal detail, so it is skipped while the selector withholds its options.
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

    // A typed email only has an optimistic accountID that the server doesn't know, so the email itself goes into the query.
    const handleSelectionChange = (selectedAccountIDs: string[], newSelectedOptions: OptionData[]) => {
        const typedEmailByAccountID = new Map<string, string>();
        for (const option of newSelectedOptions) {
            if (option.isOptimisticPersonalDetail && option.login) {
                typedEmailByAccountID.set(option.accountID.toString(), option.login);
            }
        }
        onChange(selectedAccountIDs.map((accountID) => typedEmailByAccountID.get(accountID) ?? accountID));
    };

    const {searchTerm, setSearchTerm, selectedOptions, availableOptions, totalOptionsCount, toggleSelection, areOptionsInitialized, selectedNonExistingOptions} =
        usePersonalDetailSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            initialSelected: initialSelectedAccountIDs,
            initialExtraOptions: initialTypedEmailOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            excludeFromSuggestionsOnly: expensifyTeamExclusions,
            includeLoginsOnly: workspaceMemberLogins,
            includeUserToInvite: shouldAllowTypedEmail,
            includeCurrentUser: false,
            includeRecentReports: false,
            shouldInitialize: ready,
            onSelectionChange: handleSelectionChange,
            shouldKeepSelectedInAvailableOptions: true,
        });

    // The current user and selected public-profile users without a login are excluded from personalDetails, so include them in the list when present.
    const availablePersonalDetails = availableOptions.currentUserOption ? [availableOptions.currentUserOption, ...availableOptions.personalDetails] : availableOptions.personalDetails;
    const availableAccountIDs = new Set(availablePersonalDetails.map((option) => option.accountID));
    const selectedPublicProfileOptions = selectedOptions.filter((option) => !option.login && !availableAccountIDs.has(option.accountID));
    // Only emails are offered, because the typed value is sent to the server as-is.
    const typedEmailOption = availableOptions.userToInvite?.login && Str.isValidEmail(availableOptions.userToInvite.login) ? [availableOptions.userToInvite] : [];
    const baseListData = [...selectedPublicProfileOptions, ...selectedNonExistingOptions, ...availablePersonalDetails, ...typedEmailOption];

    // moveInitialSelectionToTop keys on `value`, so map each option's accountID (keyForList) onto it. Pre-selected rows are moved to the top,
    // leaving the current user just below them in its natural sorted position.
    const listData = moveInitialSelectionToTop(
        baseListData.map((option) => ({...option, value: option.keyForList})),
        initialSelectedValues,
    );

    const headerMessage = listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const selectUser = (option: OptionData) => {
        toggleSelection(option);
    };

    const isLoadingNewOptions = !!isSearchingForReports;
    const shouldShowSearchInput = shouldAllowTypedEmail || totalOptionsCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

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
                shouldFooterBeInsideList={shouldFooterBeInsideList}
            />
        </ListFilterWrapper>
    );
}

export default UserSelector;
