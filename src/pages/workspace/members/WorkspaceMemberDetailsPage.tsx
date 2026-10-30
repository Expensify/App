import AutoUpdateTime from '@components/AutoUpdateTime';
import UserAvatar from '@components/Avatar/UserAvatar';
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PromotedActions} from '@components/PromotedActionsBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useIsSupportalSession from '@hooks/useIsSupportalSession';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalDetailByLogin, {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePrevious from '@hooks/usePrevious';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyPreventSelfApproval} from '@libs/actions/Policy/Policy';
import {clearApprovalWorkflow, removeApprovalWorkflow as removeApprovalWorkflowAction, setApprovalWorkflow, updateApprovalWorkflow} from '@libs/actions/Workflow';
import {isRuleBotEnforcingRules} from '@libs/AgentRulesUtils';
import {getAllCardsForWorkspace, getCardFeedIcon, getCardFeedWithDomainID, getPlaidInstitutionIconUrl, lastFourNumbersFromCardName, maskCardNumber} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getAssignableOfficeLocations, getMemberOfficeLocation, hasOfficeLocations} from '@libs/OfficeLocationUtils';
import {getPhoneNumber, temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {isPolicyReimburser} from '@libs/PolicyMemberRoleUtils';
import {
    areApprovalsEnabled,
    arePaymentsEnabled,
    canMemberAssignRole,
    canMemberManageMemberWithRole,
    canMemberWrite,
    hasActiveExpensifyCard,
    isControlPolicy,
    isPolicyAdmin,
    isPolicyApprover,
    PAYER_ROLES,
    shouldHideDynamicExternalWorkflowPeople,
    tryNavigateToSubmitWorkspaceUpgrade,
} from '@libs/PolicyUtils';
import {getChatHistoryTranslationKey, navigateToChatHistory, shouldShowLocalTime as shouldShowLocalTimeUtil} from '@libs/ProfileUtils';
import {getChatByParticipants, isApproverOfOutstandingPolicyReports} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import {getEffectiveWorkArrangement, getMemberLoginByAccountID, getWorkArrangementLabel} from '@libs/WorkArrangementUtils';
import {getFirstApproverLabel, INITIAL_APPROVAL_WORKFLOW, isApprovalWorkflowLockedByIntegration, updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import variables from '@styles/variables';

import {openPublicProfilePage} from '@userActions/PersonalDetails';
import {clearWorkspaceOwnerChangeFlow, openPolicyMemberProfilePage, removeMembers} from '@userActions/Policy/Member';
import {isAnonymousUser as isAnonymousUserSession} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID, Card as MemberCard, PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {createOutstandingReportsForPolicySelector} from '@selectors/Report';
import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';

type WorkspacePolicyOnyxProps = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    WorkspacePolicyOnyxProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function isNameValuePairsObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const createMemberChatReportIDSelector = (memberAccountID: number, currentUserAccountID: number) => (reports: OnyxCollection<Report>) =>
    getChatByParticipants([memberAccountID, currentUserAccountID], reports)?.reportID;

function WorkspaceMemberDetailsPage({personalDetails, policy, route}: WorkspaceMemberDetailsPageProps) {
    const policyID = route.params.policyID;
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['CommentBubbles', 'History', 'RemoveMembers', 'Transfer']);
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isWorkArrangementBetaEnabled = isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS);
    const {formatPhoneNumber, translate, localeCompare, toLocaleOrdinalWithWords} = useLocalize();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {accountID: currentUserAccountID, login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const [memberBankAccounts] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${policyID}`);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [outstandingReportsForPolicy] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {selector: createOutstandingReportsForPolicySelector(policyID)});
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const expensifyCardSettings = useExpensifyCardFeeds(policyID);
    const {showConfirmModal} = useConfirmModal();
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const isSupportalSession = useIsSupportalSession();

    const routeAccountID = Number(route.params.accountID);
    const memberLogin = personalDetails?.[routeAccountID]?.login ?? getMemberLoginByAccountID(policy, routeAccountID);
    const memberPersonalDetails = usePersonalDetailByLogin(memberLogin);
    const memberPersonalDetailsByLogin = usePersonalDetailsByLogins([memberLogin]);
    const accountID = memberPersonalDetails?.accountID ?? routeAccountID;
    const [memberChatReportID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: createMemberChatReportIDSelector(accountID, currentUserAccountID)});
    const [hasMemberChatReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${memberChatReportID}`, {selector: Boolean});
    const member = policy?.employeeList?.[memberLogin];
    const memberWorkArrangement = getEffectiveWorkArrangement(member?.hasOfficeWorkArrangement, policy?.commuterExclusions?.isOfficeWorkArrangement);
    const memberOfficeLocation = getMemberOfficeLocation(getAssignableOfficeLocations(policy, translate, localeCompare), member?.officeID);
    const prevMember = usePrevious(member);
    const details = memberPersonalDetails ?? ({} as PersonalDetails);
    const fallbackIcon = details.fallbackIcon ?? '';
    const memberAvatarSource = details.avatar ?? (memberLogin ? getDefaultAvatarURL({accountID, accountEmail: addSMSDomainIfPhoneNumber(memberLogin)}) : undefined);
    const displayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber});
    const isSelectedMemberOwner = policy?.owner === details.login;
    const isSelectedMemberCurrentUser = accountID === currentUserAccountID;
    const isCurrentUserAdmin = policy?.employeeList?.[currentUserLogin]?.role === CONST.POLICY.ROLE.ADMIN;
    const isCurrentUserOwner = policy?.owner === currentUserLogin;
    const shouldShowOfficeLocation = isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS) && hasOfficeLocations(policy);
    const canWriteMembers = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MEMBERS);
    const canChangeOfficeLocation = shouldShowOfficeLocation && canWriteMembers;
    const canManageSelectedMemberRole = canMemberAssignRole(policy, currentUserLogin, member?.role);
    const canRemoveSelectedMember = canWriteMembers && !isSelectedMemberOwner && !isSelectedMemberCurrentUser && canMemberManageMemberWithRole(policy, currentUserLogin, member?.role);
    const ownerDetails = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID];
    const policyOwnerDisplayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: ownerDetails, translate, formatPhoneNumber}) ?? policy?.owner ?? '';
    const {cardList: assignableCards, ...workspaceCards} = getAllCardsForWorkspace(workspaceAccountID, cardList, cardFeeds, expensifyCardSettings);
    const isSMSLogin = Str.isSMSLogin(memberLogin);
    const phoneNumber = getPhoneNumber(details);
    const memberLoginToCopy = isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin;
    const isReimburser = isPolicyReimburser(policy, memberLogin);
    const isExpensifyCardholder = hasActiveExpensifyCard(policy, memberLogin);
    // Only let the Authorized Payer change roles when there is another payer role they can actually move to.
    const assignablePayerRoles = PAYER_ROLES.filter((payerRole) => canMemberAssignRole(policy, currentUserLogin, payerRole));
    const canReimburserChangeRole = assignablePayerRoles.some((payerRole) => payerRole !== member?.role);
    const canEditSelectedMemberRole = !isSelectedMemberOwner && !isSelectedMemberCurrentUser && canManageSelectedMemberRole && (!isReimburser || canReimburserChangeRole);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const isCustomAgent = !!details.isCustomAgent;
    const hasDisplayNameSet = !!details.firstName || !!details.lastName;
    const canSetDisplayName = !hasDisplayNameSet && isPolicyAdmin(policy, currentUserLogin);
    const shouldShowLocalTime = shouldShowLocalTimeUtil({accountID, timezone: details.timezone, isCustomAgent, isValidated: !!details.validated});
    const shouldShowMessageButton = !isSelectedMemberCurrentUser && !isAnonymousUserSession();
    const messageAction = PromotedActions.message({
        accountID,
        login: memberLogin,
        personalDetailsByLogin: memberPersonalDetailsByLogin,
        personalDetails,
        currentUserAccountID,
        introSelected,
        isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
        hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
        hasReportActions: hasMemberChatReportActions,
        conciergeChat,
        isSupportalSession,
    });

    const {approvalWorkflows, enforcedApprovalWorkflows, availableMembers, usedApproverEmails, approverPendingActionByMemberEmail} = useApprovalWorkflows(policy);

    // The label follows this member's own workflow depth, not the workspace's.
    const memberApprovalWorkflow = enforcedApprovalWorkflows.find((workflow) => workflow.members.some((workflowMember) => workflowMember.email === memberLogin));
    const memberFirstApprover = memberApprovalWorkflow?.approvers.at(0);
    const isApprovalsEnabled = areApprovalsEnabled(policy);
    // An HR or recruiting integration in a read-only approval mode owns the workflows, so the editor rejects manual
    // edits. Keep the row visible for reference but inert, the same way the Workflows tab disables its own actions.
    const shouldAllowApproverEdit = canWriteMembers && !isApprovalWorkflowLockedByIntegration(policy);

    // A Dynamic External Workflow set to hide people takes the whole approval configuration off screen rather than
    // disabling it, so the row follows the Workflows tab and disappears instead of pointing at a Not Found editor.
    const shouldHideApprovalWorkflows = shouldHideDynamicExternalWorkflowPeople(policy);
    const approverLabel = getFirstApproverLabel((memberApprovalWorkflow?.approvers.length ?? 0) > 1, translate, toLocaleOrdinalWithWords);

    const openMemberApprovalWorkflow = () => {
        // Discard stale onyx edits or the Edit page's resume check would surface a prior abandoned session.
        clearApprovalWorkflow();

        // A member who approves their own expenses still has a workflow, so open it rather than offering to build a
        // second one. The row names them as their own approver, and a blank create page would contradict that.
        if (memberFirstApprover?.email) {
            // The editor matches the member ahead of the approver, against workflows that are not filtered down to the
            // enforced ones. A downgrade leaves a member on an inert workflow while the row already shows the default
            // approver they submit to, so naming the member there would open a workflow the workspace no longer runs.
            const memberWorkflow = approvalWorkflows.find((workflow) => workflow.members.some((workflowMember) => workflowMember.email === memberLogin));
            const isMemberOnTheWorkflowShown = memberWorkflow?.approvers.at(0)?.email === memberFirstApprover.email;

            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, memberFirstApprover.email, isMemberOnTheWorkflowShown ? memberLogin : undefined));
            return;
        }

        // Seed the draft before the plan gates so the create page already has it when an upgrade lands there.
        // This entry point goes straight to the create page, skipping the Expenses from and Approver steps that turn
        // `isInitialFlow` off, and Expenses from discards the draft on the way out while that flag is still set.
        setApprovalWorkflow({
            ...INITIAL_APPROVAL_WORKFLOW,
            isInitialFlow: false,
            members: [{email: memberLogin, displayName, avatar: details?.avatar}],
            availableMembers,
            usedApproverEmails,
        });

        // Creating a workflow is plan-gated, the same way adding one from the Workflows tab is. The `approvals`
        // upgrade is the only one that fits, since the create page this returns to runs on Control alone.
        const backTo = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID);
        if (!isControlPolicy(policy)) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, backTo));
            return;
        }

        Navigation.navigate(backTo);
    };

    useEffect(() => {
        openPolicyMemberProfilePage(policyID, accountID);
    }, [policyID, accountID]);

    // OpenPolicyMemberProfilePage doesn't return the member's timezone or validated status, which Local time needs
    useEffect(() => {
        openPublicProfilePage(accountID);
    }, [accountID]);

    // Filter out travel cards — they should not appear on the member profile page
    // as they expose card-level controls and data not intended for workspace admin view.
    const memberCards = workspaceCards
        ? Object.values(workspaceCards).filter((card) => card.accountID === accountID && card.nameValuePairs?.feedCountry !== CONST.TRAVEL.PROGRAM_TRAVEL_US)
        : [];

    const memberBankAccount = isPolicyAdmin(policy) && arePaymentsEnabled(policy) ? memberBankAccounts?.[accountID] : undefined;
    const memberBankIcon = getBankIcon({bankName: memberBankAccount?.bankName, styles});
    const memberBankNameKey = Object.values(CONST.BANK_NAMES).find((bankName) => bankName === memberBankAccount?.bankName?.toLowerCase());
    // the bank name can be an empty string
    const memberBankName = memberBankNameKey ? CONST.BANK_NAMES_USER_FRIENDLY[memberBankNameKey] : memberBankAccount?.bankName || translate('common.bankAccount');

    const isApprover = isPolicyApprover(policy, memberLogin) || isApproverOfOutstandingPolicyReports(accountID, outstandingReportsForPolicy, privateIsArchivedMap);
    const isTechnicalContact = policy?.technicalContact === details?.login;
    const exporters = [
        policy?.connections?.intacct?.config?.export?.exporter,
        policy?.connections?.quickbooksDesktop?.config?.export?.exporter,
        policy?.connections?.quickbooksOnline?.config?.export?.exporter,
        policy?.connections?.xero?.config?.export?.exporter,
        policy?.connections?.netsuite?.options?.config?.exporter,
    ];
    const isUserExporter = exporters.includes(details.login);

    let confirmModalPrompt = translate('workspace.people.removeMembersWarningPrompt', displayName, policyOwnerDisplayName);

    if (isExpensifyCardholder) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptExpensifyCard', {
            memberName: displayName,
        });
    } else if (isReimburser) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptReimburser', {
            memberName: displayName,
        });
    } else if (isTechnicalContact) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptTechContact', {
            memberName: displayName,
            workspaceOwner: policyOwnerDisplayName,
        });
    } else if (isUserExporter) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptExporter', {
            memberName: displayName,
            workspaceOwner: policyOwnerDisplayName,
        });
    } else if (!isApprover) {
        confirmModalPrompt = translate('workspace.people.removeMemberPrompt', displayName);
    } else if (isApprover) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptApprover', displayName, policyOwnerDisplayName);
    }

    useEffect(() => {
        if (!prevMember || prevMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || member?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        Navigation.goBack();
    }, [member?.pendingAction, prevMember]);

    // Function to remove a member and close the modal
    const removeMemberAndCloseModal = () => {
        removeMembers(policy, [memberLogin], {[memberLogin]: accountID});
        const previousEmployeesCount = Object.keys(policy?.employeeList ?? {}).length;
        const remainingEmployeeCount = previousEmployeesCount - 1;
        if (remainingEmployeeCount === 1 && policy?.preventSelfApproval) {
            // We can't let the "Prevent Self Approvals" enabled if there's only one workspace user
            setPolicyPreventSelfApproval(policyID, false, policy.preventSelfApproval);
        }
    };

    const removeUser = () => {
        // Fall back to the policy owner, so submitters are still reassigned when personal details aren't loaded.
        const ownerEmail = ownerDetails?.login ?? policy?.owner;

        // If the user is not an approver, proceed with member removal
        if (!memberLogin || !isPolicyApprover(policy, memberLogin) || !ownerEmail) {
            removeMemberAndCloseModal();
            return;
        }

        // Update approval workflows after approver removal
        const updatedWorkflows = updateWorkflowDataOnApproverRemoval({
            approvalWorkflows,
            removedApproverEmail: memberLogin,
            ownerEmail,
            ownerDetails,
        });

        for (const workflow of updatedWorkflows) {
            if (workflow?.removeApprovalWorkflow) {
                const {removeApprovalWorkflow, ...updatedWorkflow} = workflow;

                removeApprovalWorkflowAction(updatedWorkflow, policy);
            } else {
                updateApprovalWorkflow(workflow, [], [], policy);
            }
        }

        // Remove the member and close the modal
        removeMemberAndCloseModal();
    };

    const showRemoveMemberModal = async () => {
        const result = await showConfirmModal({
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            title: translate('workspace.people.removeMemberTitle'),
            prompt: confirmModalPrompt,
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        removeUser();
    };

    const askForConfirmationToRemove = () => {
        if (isRuleBotEnforcingRules(accountID, policy)) {
            showRuleBotGuardModal('remove', policyID);
            return;
        }
        if (isExpensifyCardholder || isReimburser) {
            showConfirmModal({
                shouldShowCancelButton: false,
                buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                title: translate('workspace.people.removeMemberTitle'),
                prompt: confirmModalPrompt,
                confirmText: translate('common.buttonConfirm'),
                cancelText: translate('common.cancel'),
            });
            return;
        }
        showRemoveMemberModal();
    };

    const navigateToDetails = (card: MemberCard) => {
        if (card.bank === CONST.EXPENSIFY_CARD.BANK) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(card.cardID.toString())));
            return;
        }
        if (!card.fundID) {
            return;
        }
        Navigation.navigate(
            createDynamicRoute(
                DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(getCardFeedWithDomainID(card.bank, card.fundID) as CompanyCardFeedWithDomainID, card.cardID.toString()),
            ),
        );
    };

    const startChangeOwnershipFlow = () => {
        clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, 'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>)));
    };

    const shouldShowNotFoundPage =
        !member || (member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && prevMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    if (shouldShowNotFoundPage) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceMemberDetailsPage"
            >
                <HeaderWithBackButton
                    title={displayName}
                    subtitle={policy?.name}
                />
                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                        <View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                                <UserAvatar
                                    containerStyles={[styles.mb4, styles.noOutline]}
                                    source={memberAvatarSource}
                                    accountID={accountID}
                                    size={CONST.AVATAR_SIZE.XXXX_LARGE}
                                    fallbackIcon={fallbackIcon}
                                />
                            </OfflineWithFeedback>
                            {!!(details.displayName ?? '') && (
                                <Text
                                    style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]}
                                    numberOfLines={1}
                                >
                                    {displayName}
                                </Text>
                            )}
                            <View style={[styles.flexRow, styles.flexWrap, styles.justifyContentCenter, styles.gap2, styles.mb5]}>
                                {isSelectedMemberOwner && isCurrentUserAdmin && !isCurrentUserOwner ? (
                                    shouldRenderTransferOwnerButton(fundList) && (
                                        <ButtonDisabledWhenOffline onPress={startChangeOwnershipFlow}>
                                            <Button.Icon src={icons.Transfer} />
                                            <Button.Text>{translate('workspace.people.transferOwner')}</Button.Text>
                                        </ButtonDisabledWhenOffline>
                                    )
                                ) : (
                                    <Button
                                        onPress={isAccountLocked ? showLockedAccountModal : askForConfirmationToRemove}
                                        isDisabled={!canRemoveSelectedMember}
                                    >
                                        <Button.Icon src={icons.RemoveMembers} />
                                        <Button.Text>{translate('workspace.people.removeWorkspaceMemberButtonTitle')}</Button.Text>
                                    </Button>
                                )}
                                {shouldShowMessageButton && (
                                    <Button onPress={messageAction.onSelected}>
                                        <Button.Icon src={icons.CommentBubbles} />
                                        <Button.Text>{translate('common.message')}</Button.Text>
                                    </Button>
                                )}
                            </View>
                        </View>
                        <View style={styles.w100}>
                            <MenuItemField
                                name={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                value={memberLoginToCopy}
                            >
                                <MenuItem.Copy value={memberLoginToCopy} />
                            </MenuItemField>
                            <OfflineWithFeedback pendingAction={details.pendingFields?.displayName}>
                                <MenuItemField
                                    name={translate('displayNamePage.headerTitle')}
                                    value={hasDisplayNameSet ? displayName : ''}
                                    onPress={canSetDisplayName ? () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_MEMBER_DISPLAY_NAME.path)) : undefined}
                                    testID="member-display-name-menu-item"
                                />
                            </OfflineWithFeedback>
                            {shouldShowLocalTime && !!details.timezone && (
                                <AutoUpdateTime
                                    timezone={details.timezone}
                                    shouldRemoveHorizontalPadding={false}
                                />
                            )}
                            <MenuItemWithTopDescription
                                disabled={!canEditSelectedMemberRole}
                                title={translate(`workspace.common.roleName`, member?.role)}
                                interactive={canEditSelectedMemberRole}
                                description={translate('common.role')}
                                shouldShowRightIcon={canEditSelectedMemberRole}
                                shouldGreyOutWhenDisabled={false}
                                shouldUseDefaultCursorWhenDisabled
                                pressableTestID="member-role-menu-item"
                                onPress={() => {
                                    if (
                                        tryNavigateToSubmitWorkspaceUpgrade(
                                            policy,
                                            true,
                                            CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.alias,
                                            ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID),
                                        )
                                    ) {
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS_ROLE.getRoute(policyID, accountID));
                                }}
                            />
                            {isApprovalsEnabled && !shouldHideApprovalWorkflows && (
                                <OfflineWithFeedback pendingAction={approverPendingActionByMemberEmail[memberLogin]}>
                                    <MenuItem.Root
                                        onPress={shouldAllowApproverEdit ? openMemberApprovalWorkflow : undefined}
                                        testID="member-approver-menu-item"
                                    >
                                        <MenuItem.Row>
                                            <MenuItemField.Content name={approverLabel}>
                                                {!!memberFirstApprover && (
                                                    <View style={styles.pr3}>
                                                        <UserPill
                                                            avatar={memberFirstApprover.avatar}
                                                            displayName={memberFirstApprover.displayName}
                                                            email={memberFirstApprover.email}
                                                            style={styles.userPillStandalone}
                                                        />
                                                    </View>
                                                )}
                                            </MenuItemField.Content>
                                            {shouldAllowApproverEdit && (
                                                <MenuItem.Trailing>
                                                    <MenuItem.Chevron />
                                                </MenuItem.Trailing>
                                            )}
                                        </MenuItem.Row>
                                    </MenuItem.Root>
                                </OfflineWithFeedback>
                            )}
                            {shouldShowOfficeLocation && (
                                <MenuItemField
                                    name={translate('workspace.people.officeLocation')}
                                    onPress={canChangeOfficeLocation ? () => Navigation.navigate(ROUTES.WORKSPACE_MEMBER_OFFICE_LOCATION.getRoute(policyID, accountID)) : undefined}
                                    testID="member-office-location-menu-item"
                                    value={
                                        memberOfficeLocation
                                            ? translate('workspace.people.officeLocationWithAddress', {name: memberOfficeLocation.name, address: memberOfficeLocation.address})
                                            : ''
                                    }
                                />
                            )}
                            {policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && isWorkArrangementBetaEnabled && (
                                <MenuItemWithTopDescription
                                    disabled={!canWriteMembers}
                                    title={getWorkArrangementLabel(translate, memberWorkArrangement)}
                                    interactive={canWriteMembers}
                                    description={translate('workspace.people.workArrangement')}
                                    shouldShowRightIcon={canWriteMembers}
                                    shouldGreyOutWhenDisabled={false}
                                    shouldUseDefaultCursorWhenDisabled
                                    pressableTestID="member-work-arrangement-menu-item"
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MEMBER_WORK_ARRANGEMENT.getRoute(policyID, accountID))}
                                />
                            )}
                            {isControlPolicy(policy) && (
                                <>
                                    <OfflineWithFeedback pendingAction={member?.pendingFields?.employeeUserID}>
                                        <MenuItemField
                                            name={translate('workspace.common.customField1')}
                                            onPress={canWriteMembers ? () => Navigation.navigate(ROUTES.WORKSPACE_CUSTOM_FIELDS.getRoute(policyID, accountID, 'customField1')) : undefined}
                                            testID="member-customField1-menu-item"
                                            value={member.employeeUserID}
                                        />
                                    </OfflineWithFeedback>
                                    <OfflineWithFeedback pendingAction={member?.pendingFields?.employeePayrollID}>
                                        <MenuItemField
                                            name={translate('workspace.common.customField2')}
                                            onPress={canWriteMembers ? () => Navigation.navigate(ROUTES.WORKSPACE_CUSTOM_FIELDS.getRoute(policyID, accountID, 'customField2')) : undefined}
                                            testID="member-customField2-menu-item"
                                            value={member.employeePayrollID}
                                        />
                                    </OfflineWithFeedback>
                                </>
                            )}
                            {!isAnonymousUserSession() && (
                                <View style={styles.mb5}>
                                    <MenuItemNavigation
                                        title={translate(getChatHistoryTranslationKey(isCustomAgent, memberLogin))}
                                        icon={icons.History}
                                        onPress={() => navigateToChatHistory(accountID)}
                                        testID="member-chat-history-menu-item"
                                    />
                                </View>
                            )}
                            {memberCards.length > 0 && (
                                <>
                                    <View style={[styles.ph5, styles.pv3]}>
                                        <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting])}>
                                            {translate('walletPage.assignedCards')}
                                        </Text>
                                    </View>
                                    {memberCards.map((memberCard) => {
                                        const isCardDeleted = memberCard.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                                        const plaidUrl = getPlaidInstitutionIconUrl(memberCard?.bank);
                                        const nameValuePairs = isNameValuePairsObject(memberCard.nameValuePairs) ? memberCard.nameValuePairs : null;
                                        const unapprovedExpenseLimit = nameValuePairs?.unapprovedExpenseLimit;
                                        const cardTitle = nameValuePairs?.cardTitle;

                                        return (
                                            <OfflineWithFeedback
                                                key={memberCard.cardID}
                                                errorRowStyles={styles.ph5}
                                                errors={memberCard.errors}
                                                pendingAction={memberCard.pendingAction}
                                            >
                                                <MenuItem
                                                    key={memberCard.cardID}
                                                    pressableTestID={`card-${memberCard.cardID}`}
                                                    title={cardTitle ?? customCardNames?.[memberCard.cardID] ?? maskCardNumber(memberCard?.cardName ?? '', memberCard.bank)}
                                                    description={memberCard?.lastFourPAN ?? lastFourNumbersFromCardName(memberCard?.cardName)}
                                                    badgeText={
                                                        memberCard.bank === CONST.EXPENSIFY_CARD.BANK && unapprovedExpenseLimit !== undefined
                                                            ? convertToDisplayString(unapprovedExpenseLimit, CONST.CURRENCY.USD)
                                                            : ''
                                                    }
                                                    icon={getCardFeedIcon(memberCard.bank as CompanyCardFeed, illustrations, companyCardFeedIcons)}
                                                    plaidUrl={plaidUrl}
                                                    displayInDefaultIconColor
                                                    iconStyles={styles.cardIcon}
                                                    iconType={plaidUrl ? CONST.ICON_TYPE_PLAID : CONST.ICON_TYPE_ICON}
                                                    iconWidth={variables.cardIconWidth}
                                                    iconHeight={variables.cardIconHeight}
                                                    onPress={() => navigateToDetails(memberCard)}
                                                    shouldRemoveHoverBackground={isCardDeleted}
                                                    disabled={isCardDeleted}
                                                    shouldShowRightIcon={!isCardDeleted}
                                                    style={[isCardDeleted ? styles.offlineFeedbackDeleted : {}]}
                                                />
                                            </OfflineWithFeedback>
                                        );
                                    })}
                                </>
                            )}
                            {!!memberBankAccount?.bankAccountLastFour && (
                                <>
                                    <View style={[styles.ph5, styles.pt3, styles.pb1]}>
                                        <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting])}>
                                            {translate('common.bankAccount')}
                                        </Text>
                                    </View>
                                    <MenuItem.Root>
                                        <MenuItem.Row>
                                            <MenuItem.Leading>
                                                <Icon
                                                    src={memberBankIcon.icon}
                                                    width={memberBankIcon.iconSize}
                                                    height={memberBankIcon.iconSize}
                                                    additionalStyles={memberBankIcon.iconStyles}
                                                />
                                            </MenuItem.Leading>
                                            <MenuItem.Content>
                                                <MenuItem.Title>{memberBankName}</MenuItem.Title>
                                                <MenuItem.Description>{memberBankAccount.bankAccountLastFour}</MenuItem.Description>
                                            </MenuItem.Content>
                                        </MenuItem.Row>
                                    </MenuItem.Root>
                                </>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsPage);
