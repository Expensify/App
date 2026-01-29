import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import ErrorMessageRow from '@components/ErrorMessageRow';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy, isExpensifyTeam, isPendingDeletePolicy} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearShareBankAccountErrors, shareBankAccount} from '@userActions/BankAccounts';
import {setWorkspacePayer} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import {navigateToAndOpenReportWithAccountIDs} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyEmployee} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspaceWorkflowsPayerSuccessPage from './WorkspaceWorkflowsPayerSuccessPage';

type WorkspaceWorkflowsPayerPageOnyxProps = {
    /** All the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsPayerPageProps = WorkspaceWorkflowsPayerPageOnyxProps &
    WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER>;
type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = Section<MemberOption>;

function WorkspaceWorkflowsPayerPage({route, policy, personalDetails, isLoadingReportData = true}: WorkspaceWorkflowsPayerPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const policyName = policy?.name ?? '';
    const policyID = policy?.id;
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const bankAccountConnectedToWorkspace = Object.values(bankAccountList ?? {}).find((account) => account?.accountData?.additionalData?.policyID === policyID);
    const bankAccountID = policy?.achAccount?.bankAccountID;
    console.log('policyID');
    console.log(policyID);
    console.log('policy?.achAccount');
    console.log(policy?.achAccount);
    console.log('bankAccountID');
    console.log(bankAccountID);
    console.log('bankAccountConnectedToWorkspace');
    console.log(bankAccountConnectedToWorkspace);
    const bankAccountInfo = bankAccountID ? bankAccountList?.[bankAccountID] : bankAccountConnectedToWorkspace;
    console.log('bankAccountList');
    console.log(bankAccountList);
    console.log('bankAccountInfo');
    console.log(bankAccountInfo);
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [searchTerm, setSearchTerm] = useState('');
    const [sharedBankAccountData] = useOnyx(ONYXKEYS.SHARE_BANK_ACCOUNT, {canBeMissing: true});
    const [selectedPayer, setSelectedPayer] = useState<string | undefined | null>(policy?.achAccount?.reimburser);
    const shouldShowSuccess = sharedBankAccountData?.shouldShowSuccess ?? false;
    const styles = useThemeStyles();
    const isLoading = sharedBankAccountData?.isLoading ?? false;
    const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
    const [showShareModal, setShowShareModal] = useState<boolean>(false);
    const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
    const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
    const selectedPayerDetails = selectedPayer ? getPersonalDetailByEmail(selectedPayer) : undefined;
    const ownerDetails = policy?.owner ? getPersonalDetailByEmail(policy?.owner) : undefined;
    const accountID = selectedPayer ? policyMemberEmailsToAccountIDs?.[selectedPayer] : '';
    const authorizedPayerEmail = personalDetails?.[accountID]?.login ?? '';

    const isDeletedPolicyEmployee = (policyEmployee: PolicyEmployee) =>
        !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors);

    const getPayersAndAdmins = () => {
        const policyAdminDetails: MemberOption[] = [];
        const authorizedPayerDetails: MemberOption[] = [];
        for (const [email, policyEmployee] of Object.entries(policy?.employeeList ?? {})) {
            const adminAccountID = policyMemberEmailsToAccountIDs?.[email] ?? '';
            const details = personalDetails?.[adminAccountID];
            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${adminAccountID}`);
                continue;
            }
            const isOwner = policy?.owner === details?.login;
            const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;
            const shouldSkipMember = isDeletedPolicyEmployee(policyEmployee) || isExpensifyTeam(details?.login) || (!isOwner && !isAdmin);
            if (shouldSkipMember) {
                continue;
            }
            const roleBadge = <Badge text={isOwner ? translate('common.owner') : translate('common.admin')} />;
            const isAuthorizedPayer = selectedPayer === details?.login;
            const formattedMember = {
                keyForList: String(adminAccountID),
                accountID: adminAccountID,
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
                        id: adminAccountID,
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
    };

    const [formattedPolicyAdmins, formattedAuthorizedPayer] = getPayersAndAdmins();

    const getSections = () => {
        const sectionsArray: MembersSection[] = [];
        if (searchTerm !== '') {
            const searchValue = getSearchValueForPhoneOrEmail(searchTerm, countryCode);
            const filteredOptions = tokenizedSearch([...formattedPolicyAdmins, ...formattedAuthorizedPayer], searchValue, (option) => [option.text ?? '', option.login ?? '']);
            return [
                {
                    title: undefined,
                    data: filteredOptions,
                    sectionIndex: 0,
                },
            ];
        }
        sectionsArray.push({
            data: formattedAuthorizedPayer,
            sectionIndex: 1,
        });
        sectionsArray.push({
            title: translate('workflowsPayerPage.admins'),
            data: formattedPolicyAdmins,
            sectionIndex: 2,
        });
        return sectionsArray;
    };

    const sections: MembersSection[] = getSections();
    const headerMessage = searchTerm && !sections.at(0)?.data.length ? translate('common.noResultsFound') : '';

    const handleConfirm = () => {
        setShowShareModal(false);
        if (!bankAccountID) {
            return;
        }
        if (!selectedPayer) {
            setIsAlertVisible(true);
            return;
        }
        if (policy?.achAccount?.reimburser === authorizedPayerEmail || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            Navigation.goBack();
            return;
        }
        shareBankAccount(Number(bankAccountID), [authorizedPayerEmail]);
    };

    const onButtonPress = () => {
        if (!selectedPayer || !policy) {
            Navigation.closeRHPFlow();
            return;
        }
        setWorkspacePayer(policy?.id, authorizedPayerEmail);
        Navigation.closeRHPFlow();
    };

    const handleShareBankAccount = () => {
        if (!selectedPayer) {
            return;
        }
        const isSelectedPayerOwner = policy?.owner === selectedPayer;
        const isSelectedAlreadyAPayer = policy?.achAccount?.reimburser === selectedPayer;
        const isAccountAlreadyShared = bankAccountInfo?.accountData?.sharees ? bankAccountInfo?.accountData.sharees.includes(selectedPayer) : false;
        if (isAccountAlreadyShared || isSelectedPayerOwner || isSelectedAlreadyAPayer) {
            onButtonPress();
            return;
        }
        if (isBankAccountPartiallySetup(bankAccountInfo?.accountData?.state)) {
            setShowValidationModal(true);
            return;
        }
        const isAccountAlreadySharedWithCurrentUser =
            bankAccountInfo?.accountData?.sharees && currentUserPersonalDetails?.login ? bankAccountInfo?.accountData?.sharees.includes(currentUserPersonalDetails?.login) : false;
        const isOwner = policy?.owner === currentUserPersonalDetails?.login;
        if (!isOwner && !isAccountAlreadyShared && !isAccountAlreadySharedWithCurrentUser) {
            setShowErrorModal(true);
            return;
        }
        setShowShareModal(true);
    };

    const setPolicyAuthorizedPayer = (member: MemberOption) => {
        const login = personalDetails?.[member.accountID]?.login;
        setSelectedPayer(login);
    };

    const shouldShowBlockingPage =
        (isEmptyObject(policy) && !isLoadingReportData) || isPendingDeletePolicy(policy) || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;

    const totalNumberOfEmployeesEitherOwnerOrAdmin = Object.entries(policy?.employeeList ?? {}).filter(([email, policyEmployee]) => {
        const isOwner = policy?.owner === email;
        const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;
        return !isDeletedPolicyEmployee(policyEmployee) && (isOwner || isAdmin);
    });

    const shouldShowSearchInput = totalNumberOfEmployeesEitherOwnerOrAdmin.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <FullPageNotFoundView
                shouldShow={shouldShowBlockingPage}
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
                    {shouldShowSuccess && selectedPayer ? (
                        <WorkspaceWorkflowsPayerSuccessPage
                            policyID={policy?.id}
                            selectedPayer={selectedPayer}
                        />
                    ) : (
                        <SelectionList
                            sections={sections}
                            ListItem={UserListItem}
                            onSelectRow={setPolicyAuthorizedPayer}
                            shouldShowTextInput={shouldShowSearchInput}
                            textInputOptions={{
                                label: translate('selectionList.findMember'),
                                value: searchTerm,
                                onChangeText: setSearchTerm,
                                headerMessage,
                            }}
                            initiallyFocusedItemKey={formattedAuthorizedPayer.at(0)?.keyForList}
                            shouldSingleExecuteRowSelect
                            addBottomSafeAreaPadding
                            footerContent={
                                <FormAlertWithSubmitButton
                                    isLoading={isLoading}
                                    message={translate('walletPage.shareBankAccountNoAdminsSelected')}
                                    isAlertVisible={isAlertVisible}
                                    shouldRenderFooterAboveSubmit
                                    isDisabled={(!formattedPolicyAdmins?.length && !formattedAuthorizedPayer?.length) || !selectedPayer}
                                    buttonText={translate('common.save')}
                                    onSubmit={handleShareBankAccount}
                                    footerContent={
                                        <ErrorMessageRow
                                            errors={sharedBankAccountData?.errors}
                                            errorRowStyles={[styles.mv3]}
                                            onDismiss={clearShareBankAccountErrors}
                                        />
                                    }
                                    containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                                />
                            }
                        />
                    )}
                </ScreenWrapper>
            </FullPageNotFoundView>
            <ConfirmModal
                title={translate('workflowsPayerPage.shareBankAccount.shareTitle')}
                isVisible={showShareModal}
                onConfirm={handleConfirm}
                onCancel={() => setShowShareModal(false)}
                success
                prompt={
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML
                            html={translate('workflowsPayerPage.shareBankAccount.shareDescription', {
                                admin: selectedPayerDetails?.displayName ?? '',
                            })}
                        />
                    </View>
                }
                confirmText={translate('common.share')}
            />
            <ConfirmModal
                title={translate('workflowsPayerPage.shareBankAccount.validationTitle')}
                isVisible={showValidationModal}
                onConfirm={() => {
                    setShowValidationModal(false);
                }}
                success
                prompt={
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML
                            onLinkPress={() => navigateToBankAccountRoute(policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID))}
                            html={translate('workflowsPayerPage.shareBankAccount.validationDescription', {
                                admin: selectedPayerDetails?.displayName ?? '',
                            })}
                        />
                    </View>
                }
                shouldShowCancelButton={false}
                confirmText={translate('common.buttonConfirm')}
            />
            <ConfirmModal
                title={translate('workflowsPayerPage.shareBankAccount.errorTitle')}
                isVisible={showErrorModal}
                onConfirm={() => {
                    setShowErrorModal(false);
                }}
                success
                prompt={
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML
                            onLinkPress={() => {
                                if (!currentUserPersonalDetails?.accountID || !policy?.ownerAccountID) {
                                    return;
                                }
                                setShowErrorModal(false);
                                navigateToAndOpenReportWithAccountIDs([currentUserPersonalDetails.accountID], policy.ownerAccountID);
                            }}
                            html={translate('workflowsPayerPage.shareBankAccount.errorDescription', {
                                admin: selectedPayerDetails?.displayName ?? '',
                                owner: ownerDetails?.displayName ?? '',
                            })}
                        />
                    </View>
                }
                shouldShowCancelButton={false}
                confirmText={translate('common.buttonConfirm')}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsPayerPage);
