import React, {useCallback, useEffect, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import {clearErrors, inviteWorkspaceEmployeesToUber} from '@libs/actions/Policy/Policy';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;

type InviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE>;

function InviteReceiptPartnerPolicyPage({route}: InviteReceiptPartnerPolicyPageProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);

    const policyID = route.params?.policyID;
    const integration = route.params?.integration;
    const policy = usePolicy(policyID);
    const shouldShowSearchInput = policy?.employeeList && Object.keys(policy.employeeList).length >= MINIMUM_MEMBER_TO_SHOW_SEARCH;
    const textInputLabel = shouldShowSearchInput ? translate('common.search') : undefined;

    const workspaceMembers = useMemo(() => {
        let membersList: MemberForList[] = [];
        if (!policy?.employeeList) {
            return membersList;
        }

        Object.entries(policy.employeeList).forEach(([email, policyEmployee]) => {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                return;
            }

            const personalDetail = getPersonalDetailByEmail(email);
            if (personalDetail) {
                const memberForList = formatMemberForList({
                    text: personalDetail?.displayName ?? email,
                    alternateText: email,
                    login: email,
                    accountID: personalDetail?.accountID,
                    icons: [
                        {
                            source: personalDetail?.avatar ?? Expensicons.FallbackAvatar,
                            name: formatPhoneNumber(email),
                            type: CONST.ICON_TYPE_AVATAR,
                            id: personalDetail?.accountID,
                        },
                    ],
                    reportID: '',
                    keyForList: email,
                });

                membersList.push({
                    ...memberForList,
                    isSelected: true,
                });
            }
        });

        membersList = sortAlphabetically(membersList, 'text', localeCompare);

        return membersList;
    }, [isOffline, policy?.employeeList, localeCompare]);

    const sections = useMemo(() => {
        if (workspaceMembers.length === 0) {
            return [];
        }

        let membersToDisplay = workspaceMembers;

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm).toLowerCase();
            membersToDisplay = tokenizedSearch(workspaceMembers, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        // Filter to show selected members first, then apply search filter to selected members
        let filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm).toLowerCase();
            filterSelectedOptions = selectedOptions.filter((option) => {
                const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                return isPartOfSearchTerm;
            });
        }

        // Combine selected members with unselected members
        const selectedLogins = selectedOptions.map(({login}) => login);
        const unselectedMembers = membersToDisplay.filter(({login}) => !selectedLogins.includes(login));

        // Update members with current selection state
        const selectedMembersWithState = filterSelectedOptions.map((member) => ({
            ...member,
            isSelected: true,
        }));

        const unselectedMembersWithState = unselectedMembers.map((member) => ({
            ...member,
            isSelected: false,
        }));

        // Combine all members (selected first, then unselected)
        const allMembersWithState = [...selectedMembersWithState, ...unselectedMembersWithState];

        return [
            {
                title: undefined,
                data: allMembersWithState,
                shouldShow: true,
            },
        ];
    }, [workspaceMembers, debouncedSearchTerm, selectedOptions]);

    // Pre-select all members on first load
    useEffect(() => {
        if (workspaceMembers.length === 0) {
            return;
        }

        const allSelectedMembers = workspaceMembers.map((member) => ({
            ...member,
            isSelected: true,
        }));

        setSelectedOptions(allSelectedMembers);
    }, [workspaceMembers]);

    const toggleOption = useCallback(
        (option: MemberForList) => {
            clearErrors(policyID);

            const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions: MemberForList[];
            if (isOptionInList) {
                newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login);
            } else {
                newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
            }

            setSelectedOptions(newSelectedOptions);
        },
        [selectedOptions, policyID],
    );

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(sections?.at(0)?.data.length !== 0, false, searchValue);
    }, [debouncedSearchTerm, sections]);

    const handleConfirm = useCallback(() => {
        if (selectedOptions.length === 0) {
            return;
        }

        const emails = selectedOptions.map((member) => member.login).filter(Boolean);

        inviteWorkspaceEmployeesToUber(policyID, emails);

        Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_CONFIRM.getRoute(policyID, integration));
    }, [selectedOptions, policyID, integration]);

    return (
        <ScreenWrapper testID={InviteReceiptPartnerPolicyPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.receiptPartners.uber.sendInvites')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList
                canSelectMultiple
                textInputLabel={textInputLabel}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                sections={sections}
                headerMessage={headerMessage}
                ListItem={InviteMemberListItem}
                onSelectRow={toggleOption}
                showConfirmButton
                confirmButtonText={translate('workspace.receiptPartners.uber.confirm')}
                onConfirm={handleConfirm}
                isConfirmButtonDisabled={selectedOptions.length === 0}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

InviteReceiptPartnerPolicyPage.displayName = 'InviteReceiptPartnerPolicyPage';

export default InviteReceiptPartnerPolicyPage;
