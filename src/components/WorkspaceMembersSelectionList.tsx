import React, {useMemo} from 'react';
import type {SectionListData} from 'react-native';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import Badge from './Badge';
import {FallbackAvatar} from './Icon/Expensicons';
import {usePersonalDetails} from './OnyxProvider';
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
    const {translate} = useLocalize();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const personalDetails = usePersonalDetails();
    const policy = usePolicy(policyID);

    const sections: ApproverSection[] = useMemo(() => {
        const approvers: SelectionListApprover[] = [];

        if (policy?.employeeList) {
            const availableApprovers = Object.values(policy.employeeList)
                .map((employee): SelectionListApprover | null => {
                    const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                    const email = employee.email;

                    if (!email) {
                        return null;
                    }

                    const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList);
                    const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
                    const {avatar, displayName = email} = personalDetails?.[accountID] ?? {};

                    return {
                        text: displayName,
                        alternateText: email,
                        keyForList: email,
                        isSelected: selectedApprover === email,
                        login: email,
                        icons: [{source: avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                        rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                    };
                })
                .filter((approver): approver is SelectionListApprover => !!approver);

            approvers.push(...availableApprovers);
        }

        const filteredApprovers =
            debouncedSearchTerm !== ''
                ? approvers.filter((option) => {
                      const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(debouncedSearchTerm);
                      const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                      return isPartOfSearchTerm;
                  })
                : approvers;

        return [
            {
                title: undefined,
                data: OptionsListUtils.sortAlphabetically(filteredApprovers, 'text'),
                shouldShow: true,
            },
        ];
    }, [debouncedSearchTerm, personalDetails, policy?.employeeList, selectedApprover, translate]);

    const handleOnSelectRow = (approver: SelectionListApprover) => {
        setApprover(approver.login);
    };

    const headerMessage = useMemo(() => (searchTerm && !sections[0].data.length ? translate('common.noResultsFound') : ''), [searchTerm, sections, translate]);

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
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
        />
    );
}

export default WorkspaceMembersSelectionList;
