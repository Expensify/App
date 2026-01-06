import React, {useMemo} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';
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
    value?: number;
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
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const orderedApprovers = useMemo(() => {
        const approvers: SelectionListApprover[] = [];

        if (policy?.employeeList) {
            const availableApprovers = Object.values(policy.employeeList)
                .map((employee): SelectionListApprover | null => {
                    const email = employee.email;

                    if (!email || employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        return null;
                    }

                    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
                    const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
                    const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                    return {
                        text: displayName,
                        alternateText: email,
                        keyForList: email,
                        isSelected: selectedApprover === email,
                        login: email,
                        icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                        rightElement: (
                            <MemberRightIcon
                                role={employee.role}
                                owner={policy?.owner}
                                login={login}
                            />
                        ),
                    };
                })
                .filter((approver): approver is SelectionListApprover => !!approver);

            approvers.push(...availableApprovers);
        }

        const filteredApprovers = tokenizedSearch(approvers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (approver) => [approver.text ?? '', approver.login ?? '']);

        return sortAlphabetically(filteredApprovers, 'text', localeCompare);
    }, [policy?.employeeList, policy?.owner, debouncedSearchTerm, countryCode, localeCompare, personalDetails, selectedApprover, icons.FallbackAvatar]);

    const handleOnSelectRow = (approver: SelectionListApprover) => {
        setApprover(approver.login);
    };

    const textInputOptions = useMemo(
        () => ({
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            value: searchTerm,
            headerMessage: searchTerm && !orderedApprovers.length ? translate('common.noResultsFound') : '',
            onChangeText: setSearchTerm,
        }),
        [searchTerm, orderedApprovers.length, setSearchTerm, translate],
    );

    return (
        <SelectionList
            data={orderedApprovers}
            ListItem={InviteMemberListItem}
            onSelectRow={handleOnSelectRow}
            textInputOptions={textInputOptions}
            showLoadingPlaceholder={!didScreenTransitionEnd}
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
