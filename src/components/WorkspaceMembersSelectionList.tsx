import React, {useMemo} from 'react';
import type {SectionListData} from 'react-native';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {FallbackAvatar} from './Icon/Expensicons';
import {usePersonalDetails} from './OnyxListItemProvider';
import SelectionList from './SelectionList';
import InviteMemberListItem from './SelectionList/InviteMemberListItem';
import type {Section} from './SelectionList/types';

type SelectionListApprover = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    login: string;
    rightElement?: React.ReactNode;
    icons: Icon[];
};
type ApproverSection = SectionListData<SelectionListApprover, Section<SelectionListApprover>>;

type WorkspaceMembersSelectionListProps = {
    policyID: string;
    selectedApprover: string;
    setApprover: (email: string) => void;
};

function WorkspaceMembersSelectionList({policyID, selectedApprover, setApprover}: WorkspaceMembersSelectionListProps) {
    const {translate, localeCompare} = useLocalize();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const personalDetails = usePersonalDetails();
    const policy = usePolicy(policyID);

    const sections: ApproverSection[] = useMemo(() => {
        const approvers: SelectionListApprover[] = [];

        if (policy?.employeeList) {
            const availableApprovers = Object.values(policy.employeeList)
                .map((employee): SelectionListApprover | null => {
                    const email = employee.email;

                    if (!email) {
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
                        icons: [{source: avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
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

        const filteredApprovers = tokenizedSearch(approvers, getSearchValueForPhoneOrEmail(debouncedSearchTerm), (approver) => [approver.text ?? '', approver.login ?? '']);

        return [
            {
                title: undefined,
                data: sortAlphabetically(filteredApprovers, 'text', localeCompare),
                shouldShow: true,
            },
        ];
    }, [debouncedSearchTerm, personalDetails, policy?.employeeList, policy?.owner, selectedApprover, localeCompare]);

    const handleOnSelectRow = (approver: SelectionListApprover) => {
        setApprover(approver.login);
    };

    const headerMessage = useMemo(() => (searchTerm && !sections.at(0)?.data.length ? translate('common.noResultsFound') : ''), [searchTerm, sections, translate]);

    return (
        <SelectionList
            sections={sections}
            ListItem={InviteMemberListItem}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputValue={searchTerm}
            onChangeText={setSearchTerm}
            headerMessage={headerMessage}
            onSelectRow={handleOnSelectRow}
            showScrollIndicator
            showLoadingPlaceholder={!didScreenTransitionEnd}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            addBottomSafeAreaPadding
        />
    );
}

export type {SelectionListApprover};

export default WorkspaceMembersSelectionList;
