import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PDFThumbnail from '@components/PDFThumbnail';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useCardFeeds from '@hooks/useCardFeeds';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldBlockCurrencyChange from '@hooks/useShouldBlockCurrencyChange';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolationOfWorkspace from '@hooks/useTransactionViolationOfWorkspace';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {close} from '@libs/actions/Modal';
import {clearInviteDraft, clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {
    calculateBillNewDot,
    clearAvatarErrors,
    clearDeleteWorkspaceError,
    clearPolicyErrorField,
    deletePolicyRulesDocument,
    deleteWorkspace,
    deleteWorkspaceAvatar,
    leaveWorkspace,
    openPolicyProfilePage,
    setIsComingFromGlobalReimbursementsFlow,
    updatePolicyRulesDocument,
    updateWorkspaceAvatar,
} from '@libs/actions/Policy/Policy';
import {filterInactiveCards, getCardSettings} from '@libs/CardUtils';
import {getLatestErrorField, getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {
    getConnectionExporters,
    getRulesDocumentSourceURL,
    getUserFriendlyWorkspaceType,
    goBackFromInvalidPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin as isPolicyAdminPolicyUtils,
    isPolicyApprover,
    isPolicyAuditor,
    isPolicyOwner,
    shouldBlockWorkspaceDeletionForInvoicifyUser,
} from '@libs/PolicyUtils';
import {formatAddressToString} from '@libs/ReportActionsUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import StringUtils from '@libs/StringUtils';
import {isSubscriptionTypeOfInvoicing, shouldCalculateBillNewDot} from '@libs/SubscriptionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {accountIDToLoginSelector} from '@src/selectors/PersonalDetails';
import {ownerPoliciesSelector} from '@src/selectors/Policy';
import {reimbursementAccountErrorSelector} from '@src/selectors/ReimbursementAccount';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceOverviewPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.PROFILE>;

function WorkspaceOverviewPage({policyDraft, policy: policyProp, route}: WorkspaceOverviewPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencySymbol} = useCurrencyListActions();
    const illustrationIcons = useMemoizedLazyIllustrations(['Building']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Exit', 'FallbackWorkspaceAvatar', 'ImageCropSquareMask', 'QrCode', 'Transfer', 'Trashcan', 'Upload', 'UserPlus']);

    const backTo = route.params.backTo;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [isComingFromGlobalReimbursementsFlow] = useOnyx(ONYXKEYS.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW);
    const [lastAccessedWorkspacePolicyID] = useOnyx(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID);
    const [reimbursementAccountError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: reimbursementAccountErrorSelector});

    // When we create a new workspace, the policy prop will be empty on the first render. Therefore, we have to use policyDraft until policy has been set in Onyx.
    const policy = policyDraft?.id ? policyDraft : policyProp;
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.profile');
    const policyID = policy?.id;
    const defaultFundID = useDefaultFundID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const settings = getCardSettings(cardSettings);
    const isBankAccountVerified = !!settings?.paymentBankAccountID;
    const shouldBlockCurrencyChange = useShouldBlockCurrencyChange(policyID);

    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);
    const outputCurrency = policy?.outputCurrency ?? '';
    const currencySymbol = getCurrencySymbol(outputCurrency) ?? '';
    const formattedCurrency = !isEmptyObject(policy) ? `${outputCurrency} - ${currencySymbol}` : '';

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, , defaultCardFeeds] = useCardFeeds(policyID);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
    });
    const hasCardFeedOrExpensifyCard =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !isEmptyObject(cardFeeds) || !isEmptyObject(cardsList) || ((policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && policy?.workspaceAccountID);

    const hasExpensifyCard = !!policy?.areExpensifyCardsEnabled && !isEmptyObject(cardsList);

    const formattedAddress = !isEmptyObject(policy) && !isEmptyObject(policy.address) ? formatAddressToString(policy.address) : '';

    const {reportsToArchive, transactionViolations} = useTransactionViolationOfWorkspace(policyID);

    const onPressCurrency = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID));
    };
    const onPressAddress = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OVERVIEW_ADDRESS.path));
    };
    const onPressName = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_NAME.getRoute(policyID));
    };
    const onPressDescription = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_DESCRIPTION.getRoute(policyID));
    };
    const onPressClientID = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CLIENT_ID.getRoute(policyID));
    };
    const onPressShare = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_SHARE.getRoute(policyID));
    };
    const onPressPlanType = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OVERVIEW_PLAN.path));
    };
    const policyName = policy?.name ?? '';
    const policyDescription = policy?.description ?? translate('workspace.common.defaultDescription');
    const policyCurrency = policy?.outputCurrency ?? '';
    const readOnly = !isPolicyAdminPolicyUtils(policy);
    const currencyReadOnly = readOnly || isBankAccountVerified;
    const isOwner = isPolicyOwner(policy, currentUserPersonalDetails.accountID);
    const shouldShowAddress = !readOnly || !!formattedAddress;
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const {isBetaEnabled} = usePermissions();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const rulesDocumentSourceURL = useMemo(
        () => getRulesDocumentSourceURL(policy?.rulesDocumentURL, policyID, session?.encryptedAuthToken ?? ''),
        [policy?.rulesDocumentURL, policyID, session?.encryptedAuthToken],
    );

    const rulesDocumentThumbnailStyle = useMemo(() => ({maxWidth: variables.rulesDocumentThumbnailMaxWidth, height: variables.rulesDocumentThumbnailHeight}), []);
    const rulesDocumentMenuPositionStyle = useMemo(() => ({top: variables.spacing2, right: variables.spacing2}), []);
    const rulesDocumentMenuIconStyle = useMemo(() => ({borderRadius: variables.componentSizeNormal / 2, backgroundColor: theme.cardBG}), [theme.cardBG]);

    const personalDetails = usePersonalDetails();
    const [accountIDToLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: accountIDToLoginSelector(reportsToArchive)});
    const [isCannotLeaveWorkspaceModalOpen, setIsCannotLeaveWorkspaceModalOpen] = useState(false);
    const privateSubscription = usePrivateSubscription();
    const accountID = currentUserPersonalDetails?.accountID;

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const ownerPolicies = ownerPoliciesSelector(policies, accountID);
    const activeOwnerPoliciesCount = ownerPolicies.filter((p) => !isPendingDeletePolicy(p)).length;
    const {shouldBlockDeletion, wouldBlockDeletion, outstandingBalanceModal} = useOutstandingBalanceGuard(activeOwnerPoliciesCount);

    const isFocused = useIsFocused();
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = usePrevious(isPendingDelete);
    const [isDeleteWorkspaceErrorModalOpen, setIsDeleteWorkspaceErrorModalOpen] = useState(false);
    const policyLastErrorMessage = getLatestErrorMessage(policy);

    const mentionReportContextValue = {policyID: policy?.id, currentReportID: undefined, exactlyMatch: true};

    const fetchPolicyData = () => {
        if (policyDraft?.id || !isFocused) {
            return;
        }
        openPolicyProfilePage(route.params.policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchPolicyData});

    const subscriptionType = privateSubscription?.type;
    const canDowngrade = account?.canDowngrade;

    // We have the same focus effect in the WorkspaceInitialPage, this way we can get the policy data in narrow
    // as well as in the wide layout when looking at policy settings.
    useFocusEffect(
        useCallback(() => {
            fetchPolicyData();
        }, [fetchPolicyData]),
    );

    const DefaultAvatar = useCallback(
        () => (
            <Avatar
                containerStyles={styles.avatarXLarge}
                imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
                source={policy?.avatarURL || getDefaultWorkspaceAvatar(policyName)}
                fallbackIcon={expensifyIcons.FallbackWorkspaceAvatar}
                size={CONST.AVATAR_SIZE.X_LARGE}
                name={policyName}
                avatarID={policyID}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
        ),
        [expensifyIcons.FallbackWorkspaceAvatar, policy?.avatarURL, policyID, policyName, styles.alignSelfCenter, styles.avatarXLarge],
    );

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const continueDeleteWorkspace = () => {
        setIsDeleteModalOpen(true);
    };

    const {setIsDeletingPaidWorkspace, isLoadingBill}: {setIsDeletingPaidWorkspace: (value: boolean) => void; isLoadingBill: boolean | undefined} =
        usePayAndDowngrade(continueDeleteWorkspace);

    const dropdownMenuRef = useRef<{setIsMenuVisible: (visible: boolean) => void} | null>(null);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const hasDeleteWorkspaceExpensifyCardsError = !!hasExpensifyCard && !!isOffline;

    const confirmDelete = () => {
        if (!policyID || !policyName) {
            return;
        }

        deleteWorkspace({
            policies,
            policyID,
            activePolicyID,
            policyName,
            lastAccessedWorkspacePolicyID,
            policyCardFeeds: defaultCardFeeds,
            reportsToArchive,
            transactionViolations,
            reimbursementAccountError,
            lastUsedPaymentMethods: lastPaymentMethod,
            localeCompare,
            personalPolicyID,
            hasDeleteWorkspaceExpensifyCardsError,
            currentUserAccountID: accountID,
            accountIDToLogin: accountIDToLogin ?? {},
        });
        if (isOffline) {
            setIsDeleteModalOpen(false);

            if (hasDeleteWorkspaceExpensifyCardsError) {
                return;
            }

            goBackFromInvalidPolicy();
        }
    };

    const handleLeaveWorkspace = () => {
        if (!policy) {
            return;
        }

        leaveWorkspace(currentUserPersonalDetails.accountID, currentUserPersonalDetails.email ?? '', policy);
        setIsLeaveModalOpen(false);
        goBackFromInvalidPolicy();
    };

    const hideDeleteWorkspaceErrorModal = () => {
        setIsDeleteWorkspaceErrorModalOpen(false);
        clearDeleteWorkspaceError(policyID);
    };

    useEffect(() => {
        if (isLoadingBill) {
            return;
        }
        dropdownMenuRef.current?.setIsMenuVisible(false);
    }, [isLoadingBill]);

    const [prevDeleteState, setPrevDeleteState] = useState({isFocused, isPendingDelete});
    if (prevDeleteState.isPendingDelete !== isPendingDelete || prevDeleteState.isFocused !== isFocused) {
        setPrevDeleteState({isFocused, isPendingDelete});
        if (isFocused && prevDeleteState.isPendingDelete && !isPendingDelete) {
            if (!policyLastErrorMessage) {
                if (isOffline && hasExpensifyCard) {
                    return;
                }

                goBackFromInvalidPolicy();
            } else {
                setIsDeleteModalOpen(false);
                setIsDeleteWorkspaceErrorModalOpen(true);
            }
        }

        if (isOffline && policyLastErrorMessage && hasExpensifyCard) {
            setIsDeleteModalOpen(false);
            setIsDeleteWorkspaceErrorModalOpen(true);
        }
    }

    const onDeleteWorkspace = () => {
        if (shouldBlockWorkspaceDeletionForInvoicifyUser(isSubscriptionTypeOfInvoicing(subscriptionType), ownerPolicies, policyID)) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DOWNGRADE_BLOCKED.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (shouldBlockDeletion()) {
            return;
        }

        if (shouldCalculateBillNewDot(canDowngrade, policies)) {
            setIsDeletingPaidWorkspace(true);
            calculateBillNewDot();
            return;
        }

        continueDeleteWorkspace();
    };

    const handleBackButtonPress = () => {
        if (isComingFromGlobalReimbursementsFlow) {
            setIsComingFromGlobalReimbursementsFlow(false);
            Navigation.goBack();
            return;
        }

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        Navigation.goBack();
    };

    const startChangeOwnershipFlow = () => {
        clearWorkspaceOwnerChangeFlow(policyID);
        requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
        Navigation.navigate(
            ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                policyID,
                currentUserPersonalDetails.accountID,
                'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                Navigation.getActiveRoute(),
            ),
        );
    };

    const handleLeave = () => {
        const isReimburser = policy?.achAccount?.reimburser === session?.email;

        if (isReimburser) {
            setIsCannotLeaveWorkspaceModalOpen(true);
            return;
        }

        setIsLeaveModalOpen(true);
    };

    const confirmModalPrompt = () => {
        const exporters = getConnectionExporters(policy);
        const policyOwnerDisplayName = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName ?? '';
        const technicalContact = policy?.technicalContact;
        const isCurrentUserReimburser = policy?.achAccount?.reimburser === session?.email;
        const userEmail = session?.email ?? '';
        const isApprover = isPolicyApprover(policy, userEmail);

        if (isCurrentUserReimburser) {
            return translate('common.leaveWorkspaceReimburser');
        }

        if (technicalContact === userEmail) {
            return translate('common.leaveWorkspaceConfirmationTechContact', policyOwnerDisplayName);
        }

        if (exporters.some((exporter) => exporter === userEmail)) {
            return translate('common.leaveWorkspaceConfirmationExporter', policyOwnerDisplayName);
        }

        if (isApprover) {
            return translate('common.leaveWorkspaceConfirmationApprover', policyOwnerDisplayName);
        }

        if (isPolicyAdminPolicyUtils(policy)) {
            return translate('common.leaveWorkspaceConfirmationAdmin');
        }

        if (isPolicyAuditor(policy)) {
            return translate('common.leaveWorkspaceConfirmationAuditor');
        }

        return translate('common.leaveWorkspaceConfirmation');
    };

    const handleRulesDocumentPicked = (files: FileObject[]) => {
        const file = files.at(0);
        if (!policyID || !file) {
            return;
        }
        updatePolicyRulesDocument(policyID, file as File, policy?.rulesDocumentURL);
    };

    const getRulesDocumentMenuItems = (openPicker: (options: {onPicked: (files: FileObject[]) => void}) => void): PopoverMenuItem[] => [
        {
            text: translate('common.replace'),
            icon: expensifyIcons.Upload,
            onSelected: () => {
                openPicker({
                    onPicked: handleRulesDocumentPicked,
                });
            },
        },
        {
            text: translate('common.remove'),
            icon: expensifyIcons.Trashcan,
            onSelected: () => {
                if (!policyID || !policy?.rulesDocumentURL) {
                    return;
                }
                deletePolicyRulesDocument(policyID, policy.rulesDocumentURL);
            },
        },
    ];

    const handleInvitePress = () => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        clearInviteDraft(route.params.policyID);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE.path));
    };

    const canLeave = !isOwner;
    const secondaryActions: Array<DropdownOption<string>> = [];

    if (readOnly) {
        if (canLeave) {
            secondaryActions.push({
                value: 'leave',
                text: translate('common.leave'),
                icon: expensifyIcons.Exit,
                onSelected: () => close(handleLeave),
            });
        }
    } else {
        secondaryActions.push({
            value: 'share',
            text: translate('common.share'),
            icon: expensifyIcons.QrCode,
            onSelected: isAccountLocked ? showLockedAccountModal : onPressShare,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.SHARE,
        });
        if (isOwner) {
            secondaryActions.push({
                value: 'delete',
                text: translate('common.delete'),
                icon: expensifyIcons.Trashcan,
                onSelected: onDeleteWorkspace,
                disabled: isLoadingBill,
                shouldShowLoadingSpinnerIcon: isLoadingBill,
                shouldCloseModalOnSelect: !shouldCalculateBillNewDot(account?.canDowngrade, policies) || wouldBlockDeletion,
            });
        }
        const isCurrentUserAdmin = policy?.employeeList?.[currentUserPersonalDetails?.login ?? '']?.role === CONST.POLICY.ROLE.ADMIN;
        const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;
        if (isCurrentUserAdmin && !isCurrentUserOwner && shouldRenderTransferOwnerButton(fundList)) {
            secondaryActions.push({
                value: 'transferOwner',
                text: translate('workspace.people.transferOwner'),
                icon: expensifyIcons.Transfer,
                onSelected: startChangeOwnershipFlow,
            });
        }
        if (canLeave) {
            secondaryActions.push({
                value: 'leave',
                text: translate('common.leave'),
                icon: expensifyIcons.Exit,
                onSelected: () => close(handleLeave),
            });
        }
    }

    const dropdownMenu = secondaryActions.length > 0 && (
        <ButtonWithDropdownMenu
            ref={dropdownMenuRef}
            success={false}
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.MORE_DROPDOWN}
            customText={translate('common.more')}
            options={secondaryActions}
            isSplitButton={false}
            wrapperStyle={isPolicyAdmin ? styles.flexGrow0 : styles.flexGrow1}
        />
    );

    const headerButtons = readOnly ? (
        dropdownMenu || null
    ) : (
        <View style={[styles.flexRow, styles.gap2]}>
            {isPolicyAdmin && (
                <Button
                    success
                    text={translate('common.invite')}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.INVITE_BUTTON}
                    icon={expensifyIcons.UserPlus}
                    onPress={handleInvitePress}
                    medium
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                />
            )}
            {dropdownMenu}
        </View>
    );

    const modals = (
        <>
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDeleteModalOpen}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                prompt={hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                isConfirmLoading={isPendingDeletePolicy(policy)}
                danger
            />
            <ConfirmModal
                title={translate('common.leaveWorkspace')}
                isVisible={isLeaveModalOpen}
                onConfirm={handleLeaveWorkspace}
                onCancel={() => setIsLeaveModalOpen(false)}
                prompt={confirmModalPrompt()}
                confirmText={translate('common.leave')}
                cancelText={translate('common.cancel')}
                danger
            />
            <ConfirmModal
                title={translate('common.leaveWorkspace')}
                isVisible={isCannotLeaveWorkspaceModalOpen}
                onConfirm={() => {
                    setIsCannotLeaveWorkspaceModalOpen(false);
                }}
                prompt={confirmModalPrompt()}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
                success
            />
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDeleteWorkspaceErrorModalOpen}
                onConfirm={hideDeleteWorkspaceErrorModal}
                onCancel={hideDeleteWorkspaceErrorModal}
                prompt={policyLastErrorMessage}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
                success={false}
            />
            {outstandingBalanceModal}
        </>
    );
    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.profile')}
            route={route}
            // When we create a new workspaces, the policy prop will not be set on the first render. Therefore, we have to delay rendering until it has been set in Onyx.
            shouldShowLoading={policy === undefined}
            shouldUseScrollView
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
            icon={illustrationIcons.Building}
            shouldShowNotFoundPage={policy === undefined}
            onBackButtonPress={handleBackButtonPress}
            addBottomSafeAreaPadding
            headerContent={!shouldUseNarrowLayout && headerButtons}
            modals={modals}
        >
            <View style={[styles.flex1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5, styles.pb5]}>{headerButtons}</View>}
                <Section
                    isCentralPane
                    title=""
                >
                    <AvatarWithImagePicker
                        onViewPhotoPress={() => {
                            if (!policyID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(policyID));
                        }}
                        source={policy?.avatarURL ?? ''}
                        avatarID={policyID}
                        size={CONST.AVATAR_SIZE.X_LARGE}
                        name={policyName}
                        avatarStyle={styles.avatarXLarge}
                        enablePreview
                        DefaultAvatar={DefaultAvatar}
                        type={CONST.ICON_TYPE_WORKSPACE}
                        fallbackIcon={expensifyIcons.FallbackWorkspaceAvatar}
                        style={[(policy?.errorFields?.avatarURL ?? shouldUseNarrowLayout) ? styles.mb1 : styles.mb3, styles.alignItemsStart, styles.sectionMenuItemTopDescription]}
                        editIconStyle={styles.smallEditIconWorkspace}
                        isUsingDefaultAvatar={!policy?.avatarURL}
                        onImageSelected={(file) => {
                            if (!policyID) {
                                return;
                            }
                            updateWorkspaceAvatar(policyID, policy.avatarURL, file as File);
                        }}
                        onImageRemoved={() => {
                            if (!policyID || !policy.avatarURL) {
                                return;
                            }
                            deleteWorkspaceAvatar(policyID, policy.avatarURL, policy.originalFileName);
                        }}
                        editorMaskImage={expensifyIcons.ImageCropSquareMask}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.AVATAR}
                        pendingAction={policy?.pendingFields?.avatarURL}
                        errors={policy?.errorFields?.avatarURL}
                        onErrorClose={() => {
                            if (!policyID) {
                                return;
                            }
                            clearAvatarErrors(policyID);
                        }}
                        disabled={readOnly}
                        disabledStyle={styles.cursorDefault}
                        errorRowStyles={styles.mt3}
                    />
                    <OfflineWithFeedback pendingAction={policy?.pendingFields?.name}>
                        <MenuItemWithTopDescription
                            title={policyName}
                            titleStyle={styles.workspaceTitleStyle}
                            description={translate('workspace.common.workspaceName')}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.NAME}
                            shouldShowRightIcon={!readOnly}
                            interactive={!readOnly}
                            wrapperStyle={[styles.sectionMenuItemTopDescription, shouldUseNarrowLayout ? styles.mt3 : {}]}
                            onPress={onPressName}
                            shouldBreakWord
                            numberOfLinesTitle={0}
                            titleAccessibilityRole={CONST.ROLE.HEADER}
                        />
                    </OfflineWithFeedback>
                    {(!StringUtils.isEmptyString(policy?.description ?? '') || !readOnly || (prevIsPendingDelete && !isPendingDelete)) && (
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.description}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.DESCRIPTION)}
                            onClose={() => {
                                if (!policyID) {
                                    return;
                                }
                                clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.DESCRIPTION);
                            }}
                        >
                            <MentionReportContext.Provider value={mentionReportContextValue}>
                                <MenuItemWithTopDescription
                                    title={policyDescription}
                                    description={translate('workspace.editor.descriptionInputLabel')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.DESCRIPTION}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressDescription}
                                    shouldRenderAsHTML
                                />
                            </MentionReportContext.Provider>
                        </OfflineWithFeedback>
                    )}
                    {!!account?.isApprovedAccountant && (
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.clientID}
                            errors={getLatestErrorField(policy ?? {}, 'clientID')}
                            onClose={() => {
                                if (!policy?.id) {
                                    return;
                                }
                                clearPolicyErrorField(policy.id, 'clientID');
                            }}
                        >
                            <MenuItemWithTopDescription
                                title={policy?.clientID}
                                description={translate('workspace.common.clientID')}
                                shouldShowRightIcon={!readOnly}
                                interactive={!readOnly}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                onPress={onPressClientID}
                            />
                        </OfflineWithFeedback>
                    )}
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingFields?.outputCurrency}
                        errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS)}
                        onClose={() => {
                            if (!policyID) {
                                return;
                            }
                            clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS);
                        }}
                        errorRowStyles={[styles.mt2]}
                    >
                        <View>
                            <MenuItemWithTopDescription
                                title={formattedCurrency}
                                description={translate('workspace.editor.currencyInputLabel')}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.CURRENCY}
                                shouldShowRightIcon={shouldBlockCurrencyChange ? false : !currencyReadOnly}
                                interactive={shouldBlockCurrencyChange ? false : !currencyReadOnly}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                onPress={onPressCurrency}
                                hintText={
                                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                    shouldBlockCurrencyChange || isBankAccountVerified
                                        ? translate('workspace.editor.currencyInputDisabledText', policyCurrency)
                                        : translate('workspace.editor.currencyInputHelpText')
                                }
                            />
                        </View>
                    </OfflineWithFeedback>
                    {shouldShowAddress && (
                        <OfflineWithFeedback pendingAction={policy?.pendingFields?.address}>
                            <View>
                                <MenuItemWithTopDescription
                                    title={formattedAddress}
                                    description={translate('common.companyAddress')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.ADDRESS}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressAddress}
                                    copyValue={readOnly ? formattedAddress : undefined}
                                    copyable={readOnly && !!formattedAddress}
                                />
                            </View>
                        </OfflineWithFeedback>
                    )}

                    {!readOnly && !!policy?.type && (
                        <OfflineWithFeedback pendingAction={policy?.pendingFields?.type}>
                            <View>
                                <MenuItemWithTopDescription
                                    title={getUserFriendlyWorkspaceType(policy.type, translate)}
                                    description={translate('workspace.common.planType')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.PLAN_TYPE}
                                    shouldShowRightIcon
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressPlanType}
                                />
                            </View>
                        </OfflineWithFeedback>
                    )}
                </Section>
                {isBetaEnabled(CONST.BETAS.CUSTOM_RULES) && (isPolicyAdmin || !!policy?.rulesDocumentURL || !StringUtils.isEmptyString(policy?.customRules ?? '')) ? (
                    <Section
                        isCentralPane
                        title={translate('workspace.rules.customRules.title')}
                        titleStyles={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb0]}
                        subtitle={translate('workspace.rules.customRules.cardSubtitle')}
                        subtitleStyles={[isPolicyAdmin || !!policy?.rulesDocumentURL ? styles.mb6 : styles.mb2]}
                        subtitleTextStyles={[styles.textNormal, styles.colorMuted, styles.mr5]}
                        containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                    >
                        {(isPolicyAdmin || !!policy?.rulesDocumentURL) && (
                            <OfflineWithFeedback
                                pendingAction={policy?.pendingFields?.rulesDocumentURL}
                                errors={getLatestErrorField(policy ?? {}, 'rulesDocumentURL')}
                                onClose={() => {
                                    if (!policyID) {
                                        return;
                                    }
                                    clearPolicyErrorField(policyID, 'rulesDocumentURL');
                                }}
                            >
                                <Text style={[styles.mutedTextLabel, styles.mb2]}>{translate('workspace.rules.customRules.policyDocument')}</Text>
                                <AttachmentPicker acceptedFileTypes={['pdf']}>
                                    {({openPicker}) => {
                                        if (policy?.rulesDocumentURL) {
                                            return (
                                                <View style={[styles.w100, rulesDocumentThumbnailStyle]}>
                                                    <PressableWithoutFeedback
                                                        onPress={() => {
                                                            if (!policyID) {
                                                                return;
                                                            }
                                                            Navigation.navigate(ROUTES.WORKSPACE_DOCUMENT.getRoute(policyID));
                                                        }}
                                                        role={CONST.ROLE.BUTTON}
                                                        accessibilityLabel={translate('workspace.rules.customRules.policyDocument')}
                                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.RULES_DOCUMENT}
                                                        style={[styles.border, styles.borderRadiusComponentLarge, styles.overflowHidden, styles.flex1]}
                                                    >
                                                        <PDFThumbnail
                                                            previewSourceURL={rulesDocumentSourceURL}
                                                            style={styles.flex1}
                                                        />
                                                    </PressableWithoutFeedback>
                                                    {isPolicyAdmin && (
                                                        <View style={[styles.pAbsolute, rulesDocumentMenuPositionStyle]}>
                                                            <ThreeDotsMenu
                                                                menuItems={getRulesDocumentMenuItems(openPicker)}
                                                                shouldSelfPosition
                                                                iconStyles={[rulesDocumentMenuIconStyle]}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        }

                                        if (!isPolicyAdmin) {
                                            return null;
                                        }

                                        return (
                                            <View style={[styles.flexRow]}>
                                                <Button
                                                    medium
                                                    text={translate('common.chooseFile')}
                                                    onPress={() => {
                                                        openPicker({
                                                            onPicked: handleRulesDocumentPicked,
                                                        });
                                                    }}
                                                />
                                            </View>
                                        );
                                    }}
                                </AttachmentPicker>
                            </OfflineWithFeedback>
                        )}

                        {(isPolicyAdmin || !StringUtils.isEmptyString(policy?.customRules ?? '')) && (
                            <OfflineWithFeedback pendingAction={policy?.pendingFields?.customRules}>
                                <MenuItemWithTopDescription
                                    title={policy?.customRules ?? ''}
                                    description={translate('workspace.rules.customRules.policyText')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.CUSTOM_RULES}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription, (isPolicyAdmin || !!policy?.rulesDocumentURL) && styles.mt4]}
                                    onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM.getRoute(route.params.policyID))}
                                    shouldRenderAsHTML
                                />
                            </OfflineWithFeedback>
                        )}
                    </Section>
                ) : null}
            </View>
        </WorkspacePageWithSections>
    );
}

export default withPolicy(WorkspaceOverviewPage);
