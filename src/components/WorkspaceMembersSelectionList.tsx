import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace, isExpensifyTeam, shouldFilterExpensifyTeam} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import MemberRightIcon from '@pages/workspace/MemberRightIcon';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

import {usePersonalDetails} from './OnyxListItemProvider';
import SelectionList from './SelectionList';
import InviteMemberListItem from './SelectionList/ListItem/InviteMemberListItem';

type SelectionListApprover = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    login: string;
    rightElement?: React.ReactNode;
    icons: Icon[];
    value: string;
};

type WorkspaceMembersSelectionListProps = {
    policyID: string;
    selectedApprover: string;
    setApprover: (email: string) => void;
};

function WorkspaceMembersSelectionList({policyID, selectedApprover, setApprover}: WorkspaceMembersSelectionListProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {translate, localeCompare} = useLocalize();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const personalDetails = usePersonalDetails();
    const policy = usePolicy(policyID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const shouldFilterOutExpensifyTeam = shouldFilterExpensifyTeam(policy?.owner, currentUserPersonalDetails?.login);
    const initialSelectedApprover = useInitialSelection(selectedApprover || undefined, {resetOnFocus: true});
    const initialSelectedApprovers = initialSelectedApprover ? [initialSelectedApprover] : [];
    const policyOwner = policy?.owner;
    const policyEmployeeList = policy?.employeeList;

    const approvers: SelectionListApprover[] = [];

    if (policyEmployeeList) {
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policyEmployeeList);

        for (const employee of Object.values(policyEmployeeList)) {
            const email = employee.email;

            if (!email || employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                continue;
            }

            if (shouldFilterOutExpensifyTeam && isExpensifyTeam(email) && selectedApprover !== email) {
                continue;
            }

            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
            const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

            approvers.push({
                text: displayName,
                alternateText: email,
                keyForList: email,
                value: email,
                isSelected: selectedApprover === email,
                login: email,
                icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                rightElement: (
                    <MemberRightIcon
                        role={employee.role}
                        owner={policyOwner}
                        login={login}
                    />
                ),
            });
        }
    }

    const sortedApprovers = sortAlphabetically(approvers, 'text', localeCompare);
    const orderedApprovers = moveInitialSelectionToTop(sortedApprovers, initialSelectedApprovers);
    const searchSourceApprovers = debouncedSearchTerm ? sortedApprovers : orderedApprovers;
    const filteredApprovers = tokenizedSearch(searchSourceApprovers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (approver) => [
        approver.text ?? '',
        approver.login ?? '',
    ]);

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        headerMessage: searchTerm && !filteredApprovers.length ? translate('common.noResultsFound') : '',
        onChangeText: setSearchTerm,
    };

    return (
        <SelectionList
            data={filteredApprovers}
            ListItem={InviteMemberListItem}
            onSelectRow={(approver) => setApprover(approver.login)}
            textInputOptions={textInputOptions}
            searchValueForFocusSync={debouncedSearchTerm}
            initiallyFocusedItemKey={initialSelectedApprover}
            shouldScrollToFocusedIndexOnMount={false}
            shouldUpdateFocusedIndex
            shouldShowLoadingPlaceholder={!didScreenTransitionEnd}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            disableMaintainingScrollPosition
            addBottomSafeAreaPadding
            showScrollIndicator
            isRowMultilineSupported
        />
    );
}

export type {SelectionListApprover};

export default WorkspaceMembersSelectionList;
