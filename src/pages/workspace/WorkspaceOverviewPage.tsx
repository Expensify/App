import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Section from '@components/Section';
import useCardFeeds from '@hooks/useCardFeeds';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolationOfWorkspace from '@hooks/useTransactionViolationOfWorkspace';
import {close} from '@libs/actions/Modal';
import {clearInviteDraft, clearWorkspaceOwnerChangeFlow, isApprover as isApproverUserAction, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {
    calculateBillNewDot,
    clearAvatarErrors,
    clearDeleteWorkspaceError,
    clearPolicyErrorField,
    deleteWorkspace,
    deleteWorkspaceAvatar,
    leaveWorkspace,
    openPolicyProfilePage,
    setIsComingFromGlobalReimbursementsFlow,
    updateWorkspaceAvatar,
} from '@libs/actions/Policy/Policy';
import {filterInactiveCards} from '@libs/CardUtils';
import {getLatestErrorField, getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {
    getConnectionExporters,
    getUserFriendlyWorkspaceType,
    goBackFromInvalidPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin as isPolicyAdminPolicyUtils,
    isPolicyAuditor,
    isPolicyOwner,
    shouldBlockWorkspaceDeletionForInvoicifyUser,
} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import StringUtils from '@libs/StringUtils';
import {isSubscriptionTypeOfInvoicing, shouldCalculateBillNewDot} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {ownerPoliciesSelector} from '@src/selectors/Policy';
import {reimbursementAccountErrorSelector} from '@src/selectors/ReimbursementAccount';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithPolicyProps} from './withPolicy';
import withPolicy from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceOverviewPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.PROFILE>;

function WorkspaceOverviewPage({policyDraft, policy: policyProp, route}: WorkspaceOverviewPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencySymbol} = useCurrencyList();
    const illustrationIcons = useMemoizedLazyIllustrations(['Building']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Exit', 'FallbackWorkspaceAvatar', 'ImageCropSquareMask', 'QrCode', 'Transfer', 'Trashcan', 'UserPlus']);

    const backTo = route.params.backTo;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [isComingFromGlobalReimbursementsFlow] = useOnyx(ONYXKEYS.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW, {canBeMissing: true});
    const [lastAccessedWorkspacePolicyID] = useOnyx(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, {canBeMissing: true});
    const [reimbursementAccountError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true, selector: reimbursementAccountErrorSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    // When we create a new workspace, the policy prop will be empty on the first render. Therefore, we have to use policyDraft until policy has been set in Onyx.
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const policyID = policy?.id;
    const defaultFundID = useDefaultFundID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});
    const isBankAccountVerified = !!cardSettings?.paymentBankAccountID;

    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);
    const outputCurrency = policy?.outputCurrency ?? '';
    const currencySymbol = getCurrencySymbol(outputCurrency) ?? '';
    const formattedCurrency = !isEmptyObject(policy) ? `${outputCurrency} - ${currencySymbol}` : '';

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, , defaultCardFeeds] = useCardFeeds(policyID);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });
    const hasCardFeedOrExpensifyCard =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !isEmptyObject(cardFeeds) || !isEmptyObject(cardsList) || ((policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && policy?.workspaceAccountID);

    const [street1, street2] = (policy?.address?.addressStreet ?? '').split('\n');
    const formattedAddress =
        !isEmptyObject(policy) && !isEmptyObject(policy.address)
            ? `${street1?.trim()}, ${street2 ? `${street2.trim()}, ` : ''}${policy.address.city}, ${policy.address.state} ${policy.address.zipCode ?? ''}`
            : '';

    const {reportsToArchive, transactionViolations} = useTransactionViolationOfWorkspace(policyID);

    const onPressCurrency = useCallback(() => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID));
    }, [policyID]);
    const onPressAddress = useCallback(() => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_ADDRESS.getRoute(policyID));
    }, [policyID]);
    const onPressName = useCallback(() => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_NAME.getRoute(policyID));
    }, [policyID]);
    const onPressDescription = useCallback(() => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_DESCRIPTION.getRoute(policyID));
    }, [policyID]);
    const onPressShare = useCallback(() => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_SHARE.getRoute(policyID));
    }, [policyID]);
    const onPressPlanType = useCallback(() => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_PLAN.getRoute(policyID));
    }, [policyID]);
    const policyName = policy?.name ?? '';
    const policyDescription = policy?.description ?? translate('workspace.common.defaultDescription');
    const policyCurrency = policy?.outputCurrency ?? '';
    const readOnly = !isPolicyAdminPolicyUtils(policy);
    const currencyReadOnly = readOnly || isBankAccountVerified;
    const isOwner = isPolicyOwner(policy, currentUserPersonalDetails.accountID);
    const shouldShowAddress = !readOnly || !!formattedAddress;
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [isCannotLeaveWorkspaceModalOpen, setIsCannotLeaveWorkspaceModalOpen] = useState(false);
    const privateSubscription = usePrivateSubscription();
    const accountID = currentUserPersonalDetails?.accountID;

    const selector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            return ownerPoliciesSelector(policies, accountID);
        },
        [accountID],
    );
    const [ownerPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector});

    const isFocused = useIsFocused();
    const isPendingDelete = isPendingDeletePolicy(policy);
    const prevIsPendingDelete = usePrevious(isPendingDelete);
    const [isDeleteWorkspaceErrorModalOpen, setIsDeleteWorkspaceErrorModalOpen] = useState(false);
    const policyLastErrorMessage = getLatestErrorMessage(policy);

    const fetchPolicyData = useCallback(() => {
        if (policyDraft?.id) {
            return;
        }
        openPolicyProfilePage(route.params.policyID);
    }, [policyDraft?.id, route.params.policyID]);

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
    const continueDeleteWorkspace = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const {setIsDeletingPaidWorkspace, isLoadingBill}: {setIsDeletingPaidWorkspace: (value: boolean) => void; isLoadingBill: boolean | undefined} =
        usePayAndDowngrade(continueDeleteWorkspace);

    const dropdownMenuRef = useRef<{setIsMenuVisible: (visible: boolean) => void} | null>(null);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const hasWorkspaceDeleteErrorOffline = !!hasCardFeedOrExpensifyCard && !!isOffline;

    const confirmDelete = useCallback(() => {
        if (!policyID || !policyName) {
            return;
        }

        deleteWorkspace({
            policyID,
            activePolicyID,
            policyName,
            lastAccessedWorkspacePolicyID,
            policyCardFeeds: defaultCardFeeds,
            reportsToArchive,
            transactionViolations,
            reimbursementAccountError,
            bankAccountList,
            lastUsedPaymentMethods: lastPaymentMethod,
            localeCompare,
            personalPolicyID,
            hasWorkspaceDeleteErrorOffline,
        });
        if (isOffline) {
            setIsDeleteModalOpen(false);

            if (hasWorkspaceDeleteErrorOffline) {
                return;
            }

            goBackFromInvalidPolicy();
        }
    }, [
        policyID,
        policyName,
        lastAccessedWorkspacePolicyID,
        defaultCardFeeds,
        reportsToArchive,
        transactionViolations,
        reimbursementAccountError,
        lastPaymentMethod,
        localeCompare,
        isOffline,
        activePolicyID,
        bankAccountList,
        personalPolicyID,
        hasWorkspaceDeleteErrorOffline,
    ]);

    const handleLeaveWorkspace = useCallback(() => {
        if (!policyID) {
            return;
        }

        leaveWorkspace(policyID);
        setIsLeaveModalOpen(false);
        goBackFromInvalidPolicy();
    }, [policyID]);

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

    useEffect(() => {
        // Handle offline error display
        if (isOffline && policyLastErrorMessage) {
            setIsDeleteWorkspaceErrorModalOpen(true);
            return;
        }

        if (!isFocused || !prevIsPendingDelete || isPendingDelete) {
            return;
        }

        if (!policyLastErrorMessage) {
            if (prevIsPendingDelete && hasWorkspaceDeleteErrorOffline) {
                return;
            }
            goBackFromInvalidPolicy();
            return;
        }
        setIsDeleteModalOpen(false);
        setIsDeleteWorkspaceErrorModalOpen(true);
    }, [isOffline, policyLastErrorMessage, isFocused, isPendingDelete, prevIsPendingDelete, hasWorkspaceDeleteErrorOffline]);

    const onDeleteWorkspace = useCallback(() => {
        if (shouldBlockWorkspaceDeletionForInvoicifyUser(isSubscriptionTypeOfInvoicing(subscriptionType), ownerPolicies, policyID)) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DOWNGRADE_BLOCKED.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (shouldCalculateBillNewDot(canDowngrade)) {
            setIsDeletingPaidWorkspace(true);
            calculateBillNewDot();
            return;
        }

        continueDeleteWorkspace();
    }, [continueDeleteWorkspace, setIsDeletingPaidWorkspace, canDowngrade, policyID, subscriptionType, ownerPolicies]);

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

        Navigation.popToSidebar();
    };

    const startChangeOwnershipFlow = useCallback(() => {
        clearWorkspaceOwnerChangeFlow(policyID);
        requestWorkspaceOwnerChange(policyID, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
        Navigation.navigate(
            ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                policyID,
                currentUserPersonalDetails.accountID,
                'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                Navigation.getActiveRoute(),
            ),
        );
    }, [currentUserPersonalDetails.accountID, currentUserPersonalDetails.login, policyID]);

    const handleLeave = useCallback(() => {
        const isReimburser = policy?.achAccount?.reimburser === session?.email;

        if (isReimburser) {
            setIsCannotLeaveWorkspaceModalOpen(true);
            return;
        }

        setIsLeaveModalOpen(true);
    }, [policy?.achAccount?.reimburser, session?.email]);

    const confirmModalPrompt = () => {
        const exporters = getConnectionExporters(policy);
        const policyOwnerDisplayName = personalDetails?.[policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName ?? '';
        const technicalContact = policy?.technicalContact;
        const isCurrentUserReimburser = policy?.achAccount?.reimburser === session?.email;
        const userEmail = session?.email ?? '';
        const isApprover = isApproverUserAction(policy, userEmail);

        if (isCurrentUserReimburser) {
            return translate('common.leaveWorkspaceReimburser');
        }

        if (technicalContact === userEmail) {
            return translate('common.leaveWorkspaceConfirmationTechContact', {
                workspaceOwner: policyOwnerDisplayName,
            });
        }

        if (exporters.some((exporter) => exporter === userEmail)) {
            return translate('common.leaveWorkspaceConfirmationExporter', {
                workspaceOwner: policyOwnerDisplayName,
            });
        }

        if (isApprover) {
            return translate('common.leaveWorkspaceConfirmationApprover', {
                workspaceOwner: policyOwnerDisplayName,
            });
        }

        if (isPolicyAdminPolicyUtils(policy)) {
            return translate('common.leaveWorkspaceConfirmationAdmin');
        }

        if (isPolicyAuditor(policy)) {
            return translate('common.leaveWorkspaceConfirmationAuditor');
        }

        return translate('common.leaveWorkspaceConfirmation');
    };

    const renderDropdownMenu = (options: Array<DropdownOption<string>>) => (
        <ButtonWithDropdownMenu
            ref={dropdownMenuRef}
            success={false}
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            customText={translate('common.more')}
            options={options}
            isSplitButton={false}
            wrapperStyle={isPolicyAdmin ? styles.flexGrow0 : styles.flexGrow1}
        />
    );

    const handleInvitePress = useCallback(() => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        clearInviteDraft(route.params.policyID);
        Navigation.navigate(ROUTES.WORKSPACE_INVITE.getRoute(route.params.policyID, Navigation.getActiveRouteWithoutParams()));
    }, [isAccountLocked, showLockedAccountModal, route.params.policyID]);

    const getHeaderButtons = () => {
        const secondaryActions: Array<DropdownOption<string>> = [];
        const canLeave = !isOwner;

        if (readOnly) {
            if (canLeave) {
                secondaryActions.push({
                    value: 'leave',
                    text: translate('common.leave'),
                    icon: expensifyIcons.Exit,
                    onSelected: () => close(handleLeave),
                });
                return renderDropdownMenu(secondaryActions);
            }
            return null;
        }

        secondaryActions.push({
            value: 'share',
            text: translate('common.share'),
            icon: expensifyIcons.QrCode,
            onSelected: isAccountLocked ? showLockedAccountModal : onPressShare,
        });
        if (isOwner) {
            secondaryActions.push({
                value: 'delete',
                text: translate('common.delete'),
                icon: expensifyIcons.Trashcan,
                onSelected: onDeleteWorkspace,
                disabled: isLoadingBill,
                shouldShowLoadingSpinnerIcon: isLoadingBill,
                shouldCloseModalOnSelect: !shouldCalculateBillNewDot(account?.canDowngrade),
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

        return (
            <View style={[styles.flexRow, styles.gap2]}>
                {isPolicyAdmin && (
                    <Button
                        success
                        text={translate('common.invite')}
                        icon={expensifyIcons.UserPlus}
                        onPress={handleInvitePress}
                        medium
                        innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                        style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    />
                )}
                {renderDropdownMenu(secondaryActions)}
            </View>
        );
    };

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
            headerContent={!shouldUseNarrowLayout && getHeaderButtons()}
            modals={modals}
        >
            {(hasVBA?: boolean) => (
                <View style={[styles.flex1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5, styles.pb5]}>{getHeaderButtons()}</View>}
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
                                updateWorkspaceAvatar(policyID, file as File);
                            }}
                            onImageRemoved={() => {
                                if (!policyID) {
                                    return;
                                }
                                deleteWorkspaceAvatar(policyID);
                            }}
                            editorMaskImage={expensifyIcons.ImageCropSquareMask}
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
                                shouldShowRightIcon={!readOnly}
                                interactive={!readOnly}
                                wrapperStyle={[styles.sectionMenuItemTopDescription, shouldUseNarrowLayout ? styles.mt3 : {}]}
                                onPress={onPressName}
                                shouldBreakWord
                                numberOfLinesTitle={0}
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
                                <MenuItemWithTopDescription
                                    title={policyDescription}
                                    description={translate('workspace.editor.descriptionInputLabel')}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressDescription}
                                    shouldRenderAsHTML
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
                                    shouldShowRightIcon={hasVBA ? false : !currencyReadOnly}
                                    interactive={hasVBA ? false : !currencyReadOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={onPressCurrency}
                                    hintText={
                                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                        hasVBA || isBankAccountVerified
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
                                        shouldShowRightIcon
                                        wrapperStyle={styles.sectionMenuItemTopDescription}
                                        onPress={onPressPlanType}
                                    />
                                </View>
                            </OfflineWithFeedback>
                        )}
                    </Section>
                    {isBetaEnabled(CONST.BETAS.CUSTOM_RULES) ? (
                        <Section
                            isCentralPane
                            title={translate('workspace.editor.policy')}
                            titleStyles={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb0]}
                            subtitle={translate('workspace.rules.customRules.cardSubtitle')}
                            subtitleStyles={[styles.mb6]}
                            subtitleTextStyles={[styles.textNormal, styles.colorMuted, styles.mr5]}
                            containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                        >
                            <OfflineWithFeedback pendingAction={policy?.pendingFields?.customRules}>
                                <MenuItemWithTopDescription
                                    title={policy?.customRules ?? ''}
                                    description={translate('workspace.editor.policy')}
                                    shouldShowRightIcon={!readOnly}
                                    interactive={!readOnly}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                    onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM.getRoute(route.params.policyID))}
                                    shouldRenderAsHTML
                                />
                            </OfflineWithFeedback>
                        </Section>
                    ) : null}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

export default withPolicy(WorkspaceOverviewPage);
