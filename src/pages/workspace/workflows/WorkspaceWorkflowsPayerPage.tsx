import React, {useCallback, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem, Section} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy, isExpensifyTeam, isPendingDeletePolicy} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setWorkspacePayer} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyEmployee} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsPayerPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsPayerPageProps = WorkspaceWorkflowsPayerPageOnyxProps &
    WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER>;
type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = SectionListData<MemberOption, Section<MemberOption>>;

function WorkspaceWorkflowsPayerPage({route, policy, personalDetails, isLoadingReportData = true}: WorkspaceWorkflowsPayerPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const policyName = policy?.name ?? '';
    const {isOffline} = useNetwork();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar'] as const);
    const [searchTerm, setSearchTerm] = useState('');

    const isDeletedPolicyEmployee = useCallback(
        (policyEmployee: PolicyEmployee) => !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors),
        [isOffline],
    );

    const [formattedPolicyAdmins, formattedAuthorizedPayer] = useMemo(() => {
        const policyAdminDetails: MemberOption[] = [];
        const authorizedPayerDetails: MemberOption[] = [];

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);

        for (const [email, policyEmployee] of Object.entries(policy?.employeeList ?? {})) {
            const accountID = policyMemberEmailsToAccountIDs?.[email] ?? '';
            const details = personalDetails?.[accountID];
            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                continue;
            }

            const isOwner = policy?.owner === details?.login;
            const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;
            const shouldSkipMember = isDeletedPolicyEmployee(policyEmployee) || isExpensifyTeam(details?.login) || (!isOwner && !isAdmin);

            if (shouldSkipMember) {
                continue;
            }

            const roleBadge = <Badge text={isOwner ? translate('common.owner') : translate('common.admin')} />;

            const isAuthorizedPayer = policy?.achAccount?.reimburser === details?.login;

            const formattedMember = {
                keyForList: String(accountID),
                accountID,
                isSelected: isAuthorizedPayer,
                isDisabled: policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors),
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: details.avatar ?? icons.FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyEmployee.errors,
                pendingAction: (policyEmployee.pendingAction ?? isAuthorizedPayer) ? policy?.pendingFields?.reimburser : null,
            };

            if (isAuthorizedPayer) {
                authorizedPayerDetails.push(formattedMember);
            } else {
                policyAdminDetails.push(formattedMember);
            }
        }
        return [policyAdminDetails, authorizedPayerDetails];
    }, [
        policy?.employeeList,
        policy?.owner,
        policy?.achAccount?.reimburser,
        policy?.pendingFields?.reimburser,
        personalDetails,
        isDeletedPolicyEmployee,
        translate,
        formatPhoneNumber,
        icons.FallbackAvatar,
    ]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArray: MembersSection[] = [];

        if (searchTerm !== '') {
            const searchValue = getSearchValueForPhoneOrEmail(searchTerm, countryCode);
            const filteredOptions = tokenizedSearch([...formattedPolicyAdmins, ...formattedAuthorizedPayer], searchValue, (option) => [option.text ?? '', option.login ?? '']);

            return [
                {
                    title: undefined,
                    data: filteredOptions,
                    shouldShow: true,
                },
            ];
        }

        sectionsArray.push({
            data: formattedAuthorizedPayer,
            shouldShow: true,
        });

        sectionsArray.push({
            title: translate('workflowsPayerPage.admins'),
            data: formattedPolicyAdmins,
            shouldShow: true,
        });
        return sectionsArray;
    }, [searchTerm, formattedAuthorizedPayer, translate, formattedPolicyAdmins, countryCode]);

    const headerMessage = useMemo(
        () => (searchTerm && !sections.at(0)?.data.length ? translate('common.noResultsFound') : ''),

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [translate, sections],
    );

    const setPolicyAuthorizedPayer = (member: MemberOption) => {
        const authorizedPayerEmail = personalDetails?.[member.accountID]?.login ?? '';

        if (policy?.achAccount?.reimburser === authorizedPayerEmail || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            Navigation.goBack();
            return;
        }

        setWorkspacePayer(policy?.id, authorizedPayerEmail);
        Navigation.goBack();
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        () => (isEmptyObject(policy) && !isLoadingReportData) || isPendingDeletePolicy(policy) || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        [policy, isLoadingReportData],
    );

    const totalNumberOfEmployeesEitherOwnerOrAdmin = useMemo(() => {
        return Object.entries(policy?.employeeList ?? {}).filter(([email, policyEmployee]) => {
            const isOwner = policy?.owner === email;
            const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;
            return !isDeletedPolicyEmployee(policyEmployee) && (isOwner || isAdmin);
        });
    }, [isDeletedPolicyEmployee, policy?.employeeList, policy?.owner]);

    const shouldShowSearchInput = totalNumberOfEmployeesEitherOwnerOrAdmin.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowSearchInput ? translate('selectionList.findMember') : undefined;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
        >
            <FullPageNotFoundView
                shouldShow={shouldShowNotFoundPage}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                onBackButtonPress={goBackFromInvalidPolicy}
                onLinkPress={goBackFromInvalidPolicy}
            >
                <ScreenWrapper
                    enableEdgeToEdgeBottomSafeAreaPadding
                    testID="WorkspaceWorkflowsPayerPage"
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPayerPage.title')}
                        subtitle={policyName}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <SelectionList
                        sections={sections}
                        textInputLabel={textInputLabel}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        ListItem={UserListItem}
                        onSelectRow={setPolicyAuthorizedPayer}
                        shouldSingleExecuteRowSelect
                        showScrollIndicator
                        addBottomSafeAreaPadding
                    />
                </ScreenWrapper>
            </FullPageNotFoundView>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsPayerPage);
