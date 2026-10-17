import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import UserSelectionListItem from '@components/SelectionList/ListItem/UserSelectionListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import {setOptimisticPersonalDetail} from '@libs/actions/PersonalDetails';
import {openSearchUserFiltersPage} from '@libs/actions/Search';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {SafeString} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';

import ListFilterWrapper from './ListFilterViewWrapper';

type UserSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    /** The currently selected workspace filter, used to limit suggestions to those workspaces' members */
    policyID: Filter | undefined;
};

function UserSelector({value = [], isNegatable, policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: UserSelectorProps) {
    const styles = useThemeStyles();
    const shouldFooterBeInsideList = useShouldFooterBeInsideList();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const shouldFocusInputOnScreenFocus = autoFocus && canFocusInputOnScreenFocus();
    const [isSearchingForUsers] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_USERS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [pagination, setPagination] = useState({hasMore: false, nextCursor: '', isLoadingMore: false});
    const requestSeqRef = useRef(0);

    const initialSelectedAccountIDs = value.reduce<Set<string>>((acc, id) => {
        const participant = personalDetails?.[id];
        if (!participant) {
            return acc;
        }

        acc.add(id);
        return acc;
    }, new Set<string>());

    // getExpensifyTeamExclusions walks every personal detail, so it is skipped while the selector withholds its options.
    const expensifyTeamExclusions = ready ? getExpensifyTeamExclusions(personalDetails, policies, currentUserPersonalDetails.email) : CONST.EMPTY_OBJECT;

    // Snapshot the pre-selected accountIDs from when the filter first opened so they can be floated to the
    // top on first render without repinning rows that are toggled afterwards.
    const initialSelectedValues = useInitialValue(() => value);

    const selectedPolicies = policyID?.value?.length ? getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY, policies) : undefined;
    const policyIDs = selectedPolicies ? selectedPolicies.map((policy) => policy.id).join(',') : '';

    // When the workspace filter is set, only suggest the members of the selected workspaces. Users that were already
    // selected when the filter opened are kept in the list even when they aren't members, so they can still be deselected here.
    const workspaceMemberLogins = (() => {
        if (!selectedPolicies) {
            return undefined;
        }

        const logins = new Set<string>();
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

    const {searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, availableOptions, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        initialSelected: initialSelectedAccountIDs,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        excludeFromSuggestionsOnly: expensifyTeamExclusions,
        includeLoginsOnly: workspaceMemberLogins,
        includeUserToInvite: true,
        includeCurrentUser: false,
        includeRecentReports: false,
        shouldInitialize: ready,
        onSelectionChange: onChange,
        shouldKeepSelectedInAvailableOptions: true,
    });

    const trimmedSearchTerm = debouncedSearchTerm.trim();

    useEffect(() => {
        if (!ready || isOffline || !trimmedSearchTerm) {
            setPagination({hasMore: false, nextCursor: '', isLoadingMore: false});
            return;
        }

        const requestSeq = ++requestSeqRef.current;
        setPagination({hasMore: false, nextCursor: '', isLoadingMore: false});

        openSearchUserFiltersPage({searchQuery: trimmedSearchTerm, cursor: '', policyIDs: policyIDs || undefined}, true)
            .then(({hasMore, nextCursor}) => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setPagination({hasMore, nextCursor, isLoadingMore: false});
            })
            .catch(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setPagination({hasMore: false, nextCursor: '', isLoadingMore: false});
            });
    }, [ready, isOffline, trimmedSearchTerm, policyIDs]);

    const loadMoreUsers = () => {
        if (isOffline || !trimmedSearchTerm || !pagination.hasMore || pagination.isLoadingMore || isSearchingForUsers) {
            return;
        }

        const requestSeq = requestSeqRef.current;
        setPagination((prev) => ({...prev, isLoadingMore: true}));

        openSearchUserFiltersPage({searchQuery: trimmedSearchTerm, cursor: pagination.nextCursor, policyIDs: policyIDs || undefined}, false)
            .then(({hasMore, nextCursor}) => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setPagination({hasMore, nextCursor, isLoadingMore: false});
            })
            .catch(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setPagination((prev) => ({...prev, isLoadingMore: false}));
            });
    };

    // The current user and selected public-profile users without a login are excluded from personalDetails, so include them in the list when present.
    const availablePersonalDetails = availableOptions.currentUserOption ? [availableOptions.currentUserOption, ...availableOptions.personalDetails] : availableOptions.personalDetails;
    const availableAccountIDs = new Set(availablePersonalDetails.map((option) => option.accountID));
    const selectedPublicProfileOptions = selectedOptions.filter((option) => !option.login && !availableAccountIDs.has(option.accountID));
    const userToInviteOptions = availableOptions.userToInvite && !availableAccountIDs.has(availableOptions.userToInvite.accountID) ? [availableOptions.userToInvite] : [];
    const baseListData = [...selectedPublicProfileOptions, ...availablePersonalDetails, ...userToInviteOptions];

    // moveInitialSelectionToTop keys on `value`, so map each option's accountID (keyForList) onto it. Pre-selected rows are moved to the top,
    // leaving the current user just below them in its natural sorted position.
    const listData = moveInitialSelectionToTop(
        baseListData.map((option) => ({...option, value: option.keyForList})),
        initialSelectedValues,
    );

    const headerMessage = listData.length === 0 ? translate('common.noResultsFound') : undefined;

    const selectUser = (option: OptionData) => {
        if (option.isOptimisticPersonalDetail && !personalDetails?.[option.accountID]) {
            const iconSource = option.icons?.[0]?.source;
            const avatar = typeof iconSource === 'function' ? undefined : SafeString(iconSource);
            setOptimisticPersonalDetail({
                accountID: option.accountID,
                login: option.login,
                displayName: option.text || option.login,
                avatar,
            });
        }
        toggleSelection(option);
    };

    const isLoadingNewOptions = !!isSearchingForUsers || pagination.isLoadingMore;

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.searchForSomeone'),
        onChangeText: setSearchTerm,
        headerMessage,
        disableAutoFocus: !shouldFocusInputOnScreenFocus,
        style: {
            containerStyle: selectionListTextInputStyle,
        },
    };

    return (
        <ListFilterWrapper
            itemCount={listData.length}
            isSearchable
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
                onEndReached={pagination.hasMore && !isOffline ? loadMoreUsers : undefined}
                onEndReachedThreshold={0.75}
                style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                footerContent={footer}
                shouldFooterBeInsideList={shouldFooterBeInsideList}
            />
        </ListFilterWrapper>
    );
}

export default UserSelector;
