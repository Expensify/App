import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
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
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type InviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE>;

function InviteReceiptPartnerPolicyPage({route}: InviteReceiptPartnerPolicyPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);
    const [isInvitationSent, setIsInvitationSent] = useState(false);

    const policyID = route.params?.policyID;
    const policy = usePolicy(policyID);
    const shouldShowTextInput = policy?.employeeList && Object.keys(policy.employeeList).length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;

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
                    isSelected: true,
                });

                membersList.push(memberForList);
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

        const allMembersWithState: MemberForList[] = [];
        filterSelectedOptions.forEach((member) => {
            allMembersWithState.push({...member, isSelected: true});
        });
        unselectedMembers.forEach((member) => {
            allMembersWithState.push({...member, isSelected: false});
        });

        return [
            {
                title: undefined,
                data: allMembersWithState,
                shouldShow: true,
            },
        ];
    }, [workspaceMembers, debouncedSearchTerm, selectedOptions]);

    // Pre-select all members only once on first load.
    useEffect(() => {
        if (workspaceMembers.length === 0) {
            return;
        }
        setSelectedOptions((prev) => {
            if (prev.length > 0) {
                return prev;
            }
            return workspaceMembers.map((member) => ({...member, isSelected: true}));
        });
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
        setIsInvitationSent(true);
    }, [selectedOptions, policyID]);

    const handleGotIt = useCallback(() => {
        Navigation.dismissModal();
    }, []);

    if (isInvitationSent) {
        return (
            <ScreenWrapper testID={InviteReceiptPartnerPolicyPage.displayName}>
                <HeaderWithBackButton
                    title={translate('workspace.receiptPartners.uber.allSet')}
                    onBackButtonPress={() => Navigation.dismissModal()}
                />
                <ConfirmationPage
                    illustration={Illustrations.ToddInCar}
                    illustrationStyle={styles.uberConfirmationIllustrationContainer}
                    heading={translate('workspace.receiptPartners.uber.readyToRoll')}
                    description={translate('workspace.receiptPartners.uber.takeBusinessRideMessage')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={handleGotIt}
                    descriptionStyle={styles.colorMuted}
                />
            </ScreenWrapper>
        );
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
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
                    headerContent={<Text style={[styles.ph5, styles.pb3]}>{translate('workspace.receiptPartners.uber.sendInvitesDescription')}</Text>}
                    shouldShowTextInputAfterHeader
                    shouldShowListEmptyContent={false}
                    shouldUpdateFocusedIndex
                    shouldShowHeaderMessageAfterHeader
                    headerMessage={headerMessage}
                    ListItem={UserListItem}
                    shouldUseDefaultRightHandSideCheckmark
                    onSelectRow={toggleOption}
                    showConfirmButton
                    confirmButtonText={translate('workspace.receiptPartners.uber.confirm')}
                    onConfirm={handleConfirm}
                    isConfirmButtonDisabled={selectedOptions.length === 0}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

InviteReceiptPartnerPolicyPage.displayName = 'InviteReceiptPartnerPolicyPage';

export default InviteReceiptPartnerPolicyPage;
