import {Str} from 'expensify-common';
import React, {useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/ButtonDisabledWhenOffline';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyPreventSelfApproval} from '@libs/actions/Policy/Policy';
import {removeApprovalWorkflow as removeApprovalWorkflowAction, updateApprovalWorkflow} from '@libs/actions/Workflow';
import {
    getAllCardsForWorkspace,
    getCardFeedIcon,
    getCompanyCardFeedWithDomainID,
    getCompanyFeeds,
    getPlaidInstitutionIconUrl,
    isExpensifyCardFullySetUp,
    lastFourNumbersFromCardName,
    maskCardNumber,
} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDisplayNameOrDefault, getPhoneNumber} from '@libs/PersonalDetailsUtils';
import {isControlPolicy} from '@libs/PolicyUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import {convertPolicyEmployeesToApprovalWorkflows, updateWorkflowDataOnApproverRemoval} from '@libs/WorkflowUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import variables from '@styles/variables';
import {clearWorkspaceOwnerChangeFlow, isApprover as isApproverUserAction, openPolicyMemberProfilePage, removeMembers} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed, Card as MemberCard, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    WorkspacePolicyOnyxProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function isNameValuePairsObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function WorkspaceMemberDetailsPage({personalDetails, policy, route}: WorkspaceMemberDetailsPageProps) {
    const policyID = route.params.policyID;
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const icons = useMemoizedLazyExpensifyIcons(['RemoveMembers', 'Info', 'Transfer'] as const);
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate, localeCompare} = useLocalize();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: true});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const expensifyCardSettings = useExpensifyCardFeeds(policyID);

    const [isRemoveMemberConfirmModalVisible, setIsRemoveMemberConfirmModalVisible] = useState(false);

    const accountID = Number(route.params.accountID);
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const prevMember = usePrevious(member);
    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = formatPhoneNumber(getDisplayNameOrDefault(details));
    const isSelectedMemberOwner = policy?.owner === details.login;
    const isSelectedMemberCurrentUser = accountID === currentUserPersonalDetails?.accountID;
    const isCurrentUserAdmin = policy?.employeeList?.[personalDetails?.[currentUserPersonalDetails?.accountID]?.login ?? '']?.role === CONST.POLICY.ROLE.ADMIN;
    const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;
    const ownerDetails = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? ({} as PersonalDetails);
    const policyOwnerDisplayName = formatPhoneNumber(getDisplayNameOrDefault(ownerDetails)) ?? policy?.owner ?? '';
    const hasMultipleFeeds = Object.keys(getCompanyFeeds(cardFeeds, false, true)).length > 0;
    const {cardList: assignableCards, ...workspaceCards} = getAllCardsForWorkspace(workspaceAccountID, cardList, cardFeeds, expensifyCardSettings);
    const isSMSLogin = Str.isSMSLogin(memberLogin);
    const phoneNumber = getPhoneNumber(details);
    const isReimburser = policy?.achAccount?.reimburser === memberLogin;
    const [isCannotRemoveUser, setIsCannotRemoveUser] = useState(false);
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    const {approvalWorkflows} = convertPolicyEmployeesToApprovalWorkflows({
        policy,
        personalDetails: personalDetails ?? {},
        localeCompare,
    });

    useEffect(() => {
        openPolicyMemberProfilePage(policyID, accountID);
    }, [policyID, accountID]);

    const memberCards = workspaceCards ? Object.values(workspaceCards).filter((card) => card.accountID === accountID) : [];

    const isApprover = isApproverUserAction(policy, memberLogin);
    const isTechnicalContact = policy?.technicalContact === details?.login;
    const exporters = [
        policy?.connections?.intacct?.config?.export?.exporter,
        policy?.connections?.quickbooksDesktop?.config?.export?.exporter,
        policy?.connections?.quickbooksOnline?.config?.export?.exporter,
        policy?.connections?.xero?.config?.export?.exporter,
        policy?.connections?.netsuite?.options?.config?.exporter,
    ];
    const isUserExporter = exporters.includes(details.login);

    let confirmModalPrompt = translate('workspace.people.removeMembersWarningPrompt', {
        memberName: displayName,
        ownerName: policyOwnerDisplayName,
    });

    if (isTechnicalContact) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptTechContact', {
            memberName: displayName,
            workspaceOwner: policyOwnerDisplayName,
        });
    } else if (isReimburser) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptReimburser', {
            memberName: displayName,
        });
    } else if (isUserExporter) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptExporter', {
            memberName: displayName,
            workspaceOwner: policyOwnerDisplayName,
        });
    } else if (!isApprover) {
        confirmModalPrompt = translate('workspace.people.removeMemberPrompt', {memberName: displayName});
    } else if (isApprover) {
        confirmModalPrompt = translate('workspace.people.removeMemberPromptApprover', {
            approver: displayName,
            workspaceOwner: policyOwnerDisplayName,
        });
    }

    useEffect(() => {
        if (!prevMember || prevMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || member?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        navigateAfterInteraction(() => Navigation.goBack());
    }, [member?.pendingAction, prevMember]);

    const askForConfirmationToRemove = () => {
        if (isReimburser) {
            setIsCannotRemoveUser(true);
            return;
        }
        setIsRemoveMemberConfirmModalVisible(true);
    };

    // Function to remove a member and close the modal
    const removeMemberAndCloseModal = () => {
        removeMembers(policyID, [memberLogin], {[memberLogin]: accountID});
        const previousEmployeesCount = Object.keys(policy?.employeeList ?? {}).length;
        const remainingEmployeeCount = previousEmployeesCount - 1;
        if (remainingEmployeeCount === 1 && policy?.preventSelfApproval) {
            // We can't let the "Prevent Self Approvals" enabled if there's only one workspace user
            setPolicyPreventSelfApproval(policyID, false);
        }
        setIsRemoveMemberConfirmModalVisible(false);
    };

    const removeUser = () => {
        const ownerEmail = ownerDetails?.login;
        const removedApprover = personalDetails?.[accountID];

        // If the user is not an approver, proceed with member removal
        if (!isApproverUserAction(policy, memberLogin) || !removedApprover?.login || !ownerEmail) {
            removeMemberAndCloseModal();
            return;
        }

        // Update approval workflows after approver removal
        const updatedWorkflows = updateWorkflowDataOnApproverRemoval({
            approvalWorkflows,
            removedApprover,
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

    const navigateToProfile = () => {
        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()));
    };

    const navigateToDetails = (card: MemberCard) => {
        if (card.bank === CONST.EXPENSIFY_CARD.BANK) {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, card.cardID.toString(), Navigation.getActiveRoute()));
            return;
        }
        if (!card.fundID) {
            return;
        }
        Navigation.navigate(
            ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(
                policyID,
                getCompanyCardFeedWithDomainID(card.bank as CompanyCardFeed, card.fundID),
                card.cardID.toString(),
                Navigation.getActiveRoute(),
            ),
        );
    };

    const startChangeOwnershipFlow = () => {
        clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, 'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        !member || (member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && prevMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    if (shouldShowNotFoundPage) {
        return <NotFoundPage />;
    }

    const shouldShowCardsSection = Object.values(expensifyCardSettings ?? {}).some((cardSettings) => isExpensifyCardFullySetUp(policy, cardSettings)) || hasMultipleFeeds;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
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
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]}
                                    imageStyles={[styles.avatarXLarge]}
                                    source={details.avatar}
                                    avatarID={accountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.X_LARGE}
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
                            {isSelectedMemberOwner && isCurrentUserAdmin && !isCurrentUserOwner ? (
                                shouldRenderTransferOwnerButton(fundList) && (
                                    <ButtonDisabledWhenOffline
                                        text={translate('workspace.people.transferOwner')}
                                        onPress={startChangeOwnershipFlow}
                                        icon={icons.Transfer}
                                        style={styles.mb5}
                                    />
                                )
                            ) : (
                                <Button
                                    text={translate('workspace.people.removeWorkspaceMemberButtonTitle')}
                                    onPress={isAccountLocked ? showLockedAccountModal : askForConfirmationToRemove}
                                    isDisabled={isSelectedMemberOwner || isSelectedMemberCurrentUser}
                                    icon={icons.RemoveMembers}
                                    style={styles.mb5}
                                />
                            )}
                            <ConfirmModal
                                danger
                                title={translate('workspace.people.removeMemberTitle')}
                                isVisible={isRemoveMemberConfirmModalVisible}
                                onConfirm={removeUser}
                                onCancel={() => setIsRemoveMemberConfirmModalVisible(false)}
                                prompt={confirmModalPrompt}
                                confirmText={translate('common.remove')}
                                cancelText={translate('common.cancel')}
                            />
                            <ConfirmModal
                                title={translate('workspace.people.removeMemberTitle')}
                                isVisible={isCannotRemoveUser}
                                onConfirm={() => {
                                    setIsCannotRemoveUser(false);
                                }}
                                prompt={confirmModalPrompt}
                                confirmText={translate('common.buttonConfirm')}
                                success
                                shouldShowCancelButton={false}
                            />
                        </View>
                        <View style={styles.w100}>
                            <MenuItemWithTopDescription
                                title={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber ?? '') : memberLogin}
                                description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')}
                                interactive={false}
                                copyable
                            />
                            <MenuItemWithTopDescription
                                disabled={isSelectedMemberOwner || isSelectedMemberCurrentUser}
                                title={translate(`workspace.common.roleName`, {role: member?.role})}
                                description={translate('common.role')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS_ROLE.getRoute(policyID, accountID))}
                            />
                            {isControlPolicy(policy) && (
                                <>
                                    <OfflineWithFeedback pendingAction={member?.pendingFields?.employeeUserID}>
                                        <MenuItemWithTopDescription
                                            description={translate('workspace.common.customField1')}
                                            title={member?.employeeUserID}
                                            shouldShowRightIcon
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_CUSTOM_FIELDS.getRoute(policyID, accountID, 'customField1'))}
                                        />
                                    </OfflineWithFeedback>
                                    <OfflineWithFeedback pendingAction={member?.pendingFields?.employeePayrollID}>
                                        <MenuItemWithTopDescription
                                            description={translate('workspace.common.customField2')}
                                            title={member?.employeePayrollID}
                                            shouldShowRightIcon
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_CUSTOM_FIELDS.getRoute(policyID, accountID, 'customField2'))}
                                        />
                                    </OfflineWithFeedback>
                                </>
                            )}
                            <MenuItem
                                style={styles.mb5}
                                title={translate('common.profile')}
                                icon={icons.Info}
                                onPress={navigateToProfile}
                                shouldShowRightIcon
                            />
                            {shouldShowCardsSection && (
                                <>
                                    {memberCards.length > 0 && (
                                        <View style={[styles.ph5, styles.pv3]}>
                                            <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting])}>
                                                {translate('walletPage.assignedCards')}
                                            </Text>
                                        </View>
                                    )}
                                    {memberCards.map((memberCard) => {
                                        const isCardDeleted = memberCard.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                                        const plaidUrl = getPlaidInstitutionIconUrl(memberCard?.bank);
                                        const nameValuePairs = isNameValuePairsObject(memberCard.nameValuePairs) ? memberCard.nameValuePairs : null;
                                        const unapprovedExpenseLimit = nameValuePairs?.unapprovedExpenseLimit;
                                        const cardTitle = nameValuePairs?.cardTitle;

                                        return (
                                            <OfflineWithFeedback
                                                key={`${cardTitle ?? ''}_${memberCard.cardID}`}
                                                errorRowStyles={styles.ph5}
                                                errors={memberCard.errors}
                                                pendingAction={memberCard.pendingAction}
                                            >
                                                <MenuItem
                                                    key={memberCard.cardID}
                                                    title={cardTitle ?? customCardNames?.[memberCard.cardID] ?? maskCardNumber(memberCard?.cardName ?? '', memberCard.bank)}
                                                    description={memberCard?.lastFourPAN ?? lastFourNumbersFromCardName(memberCard?.cardName)}
                                                    badgeText={
                                                        memberCard.bank === CONST.EXPENSIFY_CARD.BANK && unapprovedExpenseLimit !== undefined
                                                            ? convertToDisplayString(unapprovedExpenseLimit)
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
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberDetailsPage);
