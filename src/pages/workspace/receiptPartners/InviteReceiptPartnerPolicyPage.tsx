import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
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
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type InviteReceiptPartnerPolicyPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE>;

function InviteReceiptPartnerPolicyPage({route}: InviteReceiptPartnerPolicyPageProps) {
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ToddInCar']);
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);
    const [isInvitationSent, setIsInvitationSent] = useState(false);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const policyID = route.params?.policyID;
    const policy = usePolicy(policyID);
    const shouldShowTextInput = policy?.employeeList && Object.keys(policy.employeeList).length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const workspaceMembers = useMemo(() => {
        let membersList: MemberForList[] = [];
        if (!policy?.employeeList) {
            return membersList;
        }

        // Get the list of employees from the U4B organization
        const uberEmployees = policy?.receiptPartners?.uber?.employees ?? {};

        for (const [email, policyEmployee] of Object.entries(policy.employeeList)) {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            // Skip employees who are in the "Linked" section
            const employeeStatus = uberEmployees[email]?.status;
            if (
                employeeStatus === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED ||
                employeeStatus === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL ||
                employeeStatus === CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED
            ) {
                continue;
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
                            source: personalDetail?.avatar ?? icons.FallbackAvatar,
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
        }

        membersList = sortAlphabetically(membersList, 'text', localeCompare);

        return membersList;
    }, [policy?.employeeList, policy?.receiptPartners?.uber?.employees, localeCompare, isOffline, icons.FallbackAvatar]);

    const data = useMemo(() => {
        if (workspaceMembers.length === 0) {
            return [];
        }

        let membersToDisplay = workspaceMembers;

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            membersToDisplay = tokenizedSearch(workspaceMembers, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        // Filter to show selected members first, then apply search filter to selected members
        let filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            filterSelectedOptions = selectedOptions.filter((option) => {
                const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                return isPartOfSearchTerm;
            });
        }

        // Combine selected members with unselected members
        const selectedLogins = new Set(selectedOptions.map(({login}) => login));
        const unselectedMembers = membersToDisplay.filter(({login}) => !selectedLogins.has(login));

        const allMembersWithState: MemberForList[] = [];
        for (const member of filterSelectedOptions) {
            allMembersWithState.push({...member, isSelected: true});
        }
        for (const member of unselectedMembers) {
            allMembersWithState.push({...member, isSelected: false});
        }

        return allMembersWithState;
    }, [workspaceMembers, countryCode, debouncedSearchTerm, selectedOptions]);

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

        return getHeaderMessage(data.length !== 0, false, searchValue, countryCode, false);
    }, [debouncedSearchTerm, data.length, countryCode]);

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

    // Check if we should skip to "All set" page immediately
    const shouldSkipToAllSet = useMemo(() => {
        // Skip if no workspace members can be invited (covers all cases: no employees, only owner, already linked)
        return workspaceMembers.length === 0;
    }, [workspaceMembers.length]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            onConfirm: handleConfirm,
            text: translate('workspace.receiptPartners.uber.confirm'),
            isDisabled: selectedOptions.length === 0,
        }),
        [handleConfirm, selectedOptions.length, translate],
    );

    const textInputOptions = useMemo(
        () => ({
            headerMessage,
            label: shouldShowTextInput ? translate('common.search') : undefined,
            value: searchTerm,
            onChangeText: setSearchTerm,
            shouldBeInsideList: true,
        }),
        [headerMessage, searchTerm, setSearchTerm, shouldShowTextInput, translate],
    );

    if (isInvitationSent || shouldSkipToAllSet) {
        return (
            <ScreenWrapper testID="InviteReceiptPartnerPolicyPage">
                <HeaderWithBackButton
                    title={translate('workspace.receiptPartners.uber.allSet')}
                    onBackButtonPress={() => Navigation.dismissModal()}
                />
                <ConfirmationPage
                    illustration={illustrations.ToddInCar}
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
            <ScreenWrapper testID="InviteReceiptPartnerPolicyPage">
                <HeaderWithBackButton
                    title={translate('workspace.receiptPartners.uber.sendInvites')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SelectionList
                    data={data}
                    ListItem={UserListItem}
                    onSelectRow={toggleOption}
                    customListHeader={<Text style={[styles.ph5, styles.pb3]}>{translate('workspace.receiptPartners.uber.sendInvitesDescription')}</Text>}
                    confirmButtonOptions={confirmButtonOptions}
                    textInputOptions={textInputOptions}
                    showListEmptyContent={false}
                    shouldUseDefaultRightHandSideCheckmark
                    disableMaintainingScrollPosition
                    addBottomSafeAreaPadding
                    canSelectMultiple
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default InviteReceiptPartnerPolicyPage;
