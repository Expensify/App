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

import {openSearchUserFiltersPage} from '@libs/actions/Search';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getExpensifyTeamExclusions} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
    const [isSearching, setIsSearching] = useState(() => ready && !isOffline);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [pagination, setPagination] = useState({hasMore: false, nextCursor: '', isLoadingMore: false});
    const [serverScopedLoginsByPolicy, setServerScopedLoginsByPolicy] = useState<{policyIDs: string; logins: string[]}>({policyIDs: '', logins: []});
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
    const serverScopedLogins = serverScopedLoginsByPolicy.policyIDs === policyIDs ? serverScopedLoginsByPolicy.logins : [];

    // When the workspace filter is set, only suggest the members of the selected workspaces and people returned by
    // the server for those workspaces' reports (such as removed members). Users that were already selected when the
    // filter opened are kept in the list even when they aren't members, so they can still be deselected here.
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
        for (const login of serverScopedLogins) {
            logins.add(login);
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
        includeCurrentUser: false,
        includeRecentReports: false,
        shouldInitialize: ready,
        onSelectionChange: onChange,
        shouldKeepSelectedInAvailableOptions: true,
    });

    const trimmedSearchTerm = debouncedSearchTerm.trim();

    // Reset pagination synchronously (without an effect) whenever the search key changes, so a new
    // search never reuses the previous query's cursor. See https://react.dev/reference/react/useState#storing-information-from-previous-renders
    const [prevSearchKey, setPrevSearchKey] = useState({trimmedSearchTerm, policyIDs, isOffline});
    if (prevSearchKey.trimmedSearchTerm !== trimmedSearchTerm || prevSearchKey.policyIDs !== policyIDs || prevSearchKey.isOffline !== isOffline) {
        setPrevSearchKey({trimmedSearchTerm, policyIDs, isOffline});
        setPagination({hasMore: false, nextCursor: '', isLoadingMore: false});
        setIsSearching(ready && !isOffline);
    }

    const applyUserFiltersResponse = (requestSeq: number, {hasMore, nextCursor, logins}: {hasMore: boolean; nextCursor: string; logins: string[]}) => {
        if (requestSeq !== requestSeqRef.current) {
            return;
        }
        setIsSearching(false);
        if (policyIDs && logins.length > 0) {
            setServerScopedLoginsByPolicy((prev) => ({
                policyIDs,
                logins: prev.policyIDs === policyIDs ? Array.from(new Set([...prev.logins, ...logins])) : logins,
            }));
        }
        setPagination({hasMore, nextCursor, isLoadingMore: false});
    };

    useEffect(() => {
        if (!ready || isOffline) {
            return;
        }

        const requestSeq = ++requestSeqRef.current;

        openSearchUserFiltersPage({searchQuery: trimmedSearchTerm, cursor: '', policyIDs: policyIDs || undefined}, true)
            .then((result) => applyUserFiltersResponse(requestSeq, result))
            .catch(() => {
                if (requestSeq !== requestSeqRef.current) {
                    return;
                }
                setIsSearching(false);
                setPagination({hasMore: false, nextCursor: '', isLoadingMore: false});
            });
    }, [ready, isOffline, trimmedSearchTerm, policyIDs, applyUserFiltersResponse]);

    const loadMoreUsers = () => {
        if (isOffline || !pagination.hasMore || pagination.isLoadingMore || isSearching) {
            return;
        }

        const requestSeq = requestSeqRef.current;
        setPagination((prev) => ({...prev, isLoadingMore: true}));

        openSearchUserFiltersPage({searchQuery: trimmedSearchTerm, cursor: pagination.nextCursor, policyIDs: policyIDs || undefined}, false)
            .then((result) => applyUserFiltersResponse(requestSeq, result))
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
    const baseListData = [...selectedPublicProfileOptions, ...availablePersonalDetails];

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

    const isLoadingNewOptions = isSearching || pagination.isLoadingMore;

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
