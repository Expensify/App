import {useIsFocused} from '@react-navigation/native';
import {hasSeenTourSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {createPoliciesSelector} from '@selectors/Policy';
import {Str} from 'expensify-common';
import type {ImageContentFit} from 'expo-image';
import type {ForwardedRef} from 'react';
import React, {useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import {openOldDotLink} from '@libs/actions/Link';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import {createNewReport, startNewChat} from '@libs/actions/Report';
import {startTestDrive} from '@libs/actions/Tour';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink, shouldOpenTravelDotLinkWeb} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {
    areAllGroupPoliciesExpenseChatDisabled,
    canSendInvoice as canSendInvoicePolicyUtils,
    getDefaultChatEnabledPolicy,
    getGroupPaidPoliciesWithExpenseChatEnabled,
    isPaidGroupPolicy,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {getQuickActionIcon, getQuickActionTitle, isQuickActionAllowed} from '@libs/QuickActionUtils';
import {
    generateReportID,
    getDisplayNameForParticipant,
    getIcons,
    // Will be fixed in https://github.com/Expensify/App/issues/76852
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getReportName,
    getWorkspaceChats,
    hasEmptyReportsForPolicy,
    hasViolations as hasViolationsReportUtils,
    isPolicyExpenseChat,
    reportSummariesOnyxSelector,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import isOnSearchMoneyRequestReportPage from '@navigation/helpers/isOnSearchMoneyRequestReportPage';
import variables from '@styles/variables';
import {closeReactNativeApp} from '@userActions/HybridApp';
import {clearLastSearchParams} from '@userActions/ReportNavigation';
import Tab from '@userActions/Tab';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'role' | 'isPolicyExpenseChatEnabled' | 'pendingAction' | 'avatarURL' | 'name' | 'id' | 'areInvoicesEnabled'>;

type FloatingActionButtonAndPopoverProps = {
    /* Callback function when the menu is shown */
    onShowCreateMenu?: () => void;

    /* Callback function before the menu is hidden */
    onHideCreateMenu?: () => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<FloatingActionButtonAndPopoverRef>;
};

type FloatingActionButtonAndPopoverRef = {
    hideCreateMenu: () => void;
};

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        role: policy.role,
        id: policy.id,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
        avatarURL: policy.avatarURL,
        name: policy.name,
        areInvoicesEnabled: policy.areInvoicesEnabled,
    }) as PolicySelector;

const policiesSelector = (policies: OnyxCollection<OnyxTypes.Policy>) => createPoliciesSelector(policies, policySelector);

const sessionSelector = (session: OnyxEntry<OnyxTypes.Session>) => ({email: session?.email, accountID: session?.accountID});

const accountPrimaryLoginSelector = (account: OnyxEntry<OnyxTypes.Account>) => account?.primaryLogin;

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover({onHideCreateMenu, onShowCreateMenu, ref}: FloatingActionButtonAndPopoverProps) {
    const icons = useMemoizedLazyExpensifyIcons([
        'CalendarSolid',
        'Document',
        'NewWorkspace',
        'NewWindow',
        'Binoculars',
        'Car',
        'Location',
        'Suitcase',
        'Task',
        'InvoiceGeneric',
        'ReceiptScan',
        'ChatBubble',
        'Coins',
        'Receipt',
        'Cash',
        'Transfer',
        'MoneyCircle',
    ] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber} = useLocalize();
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: sessionSelector});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [quickActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${quickAction?.chatReportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [reportSummaries = getEmptyArray<ReturnType<typeof reportSummariesOnyxSelector>[number]>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: reportSummariesOnyxSelector,
    });
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isRestrictedToPreferredPolicy, isRestrictedPolicyCreation} = usePreferredPolicy();
    const policyChatForActivePolicy = useMemo(() => {
        if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
            return {} as OnyxTypes.Report;
        }
        const policyChatsForActivePolicy = getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], allReports);
        return policyChatsForActivePolicy.length > 0 ? policyChatsForActivePolicy.at(0) : ({} as OnyxTypes.Report);
    }, [activePolicy, activePolicyID, session?.accountID, allReports]);
    const [quickActionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${quickActionReport?.policyID}`, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const isReportArchived = useReportIsArchived(quickActionReport?.reportID);
    const {isOffline} = useNetwork();
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const {isBetaEnabled} = usePermissions();
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: accountPrimaryLoginSelector, canBeMissing: true});
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');

    const canSendInvoice = useMemo(() => canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email), [allPolicies, session?.email]);
    const isValidReport = !(isEmptyObject(quickActionReport) || isReportArchived);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
        canBeMissing: true,
    });
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {selector: tryNewDotOnyxSelector, canBeMissing: true});

    const isUserPaidPolicyMember = useIsPaidPolicyAdmin();
    const reportID = useMemo(() => generateReportID(), []);

    const isReportInSearch = isOnSearchMoneyRequestReportPage();
    const groupPoliciesWithChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled(allPolicies as OnyxCollection<OnyxTypes.Policy>);

    /**
     * There are scenarios where users who have not yet had their group workspace-chats in NewDot (isPolicyExpenseChatEnabled). In those scenarios, things can get confusing if they try to submit/track expenses. To address this, we block them from Creating, Tracking, Submitting expenses from NewDot if they are:
     * 1. on at least one group policy
     * 2. none of the group policies they are a member of have isPolicyExpenseChatEnabled=true
     */
    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {});
    }, [allPolicies]);
    const shouldShowCreateReportOption = shouldRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0;

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );

    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, {canBeMissing: true});

    const shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy = useMemo(
        () => hasEmptyReportsForPolicy(reportSummaries, defaultChatEnabledPolicyID, session?.accountID) && hasDismissedEmptyReportsConfirmation !== true,
        [defaultChatEnabledPolicyID, hasDismissedEmptyReportsConfirmation, reportSummaries, session?.accountID],
    );

    const handleCreateWorkspaceReport = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            if (isReportInSearch) {
                clearLastSearchParams();
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isASAPSubmitBetaEnabled,
                defaultChatEnabledPolicy,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(
                    isSearchTopmostFullScreenRoute()
                        ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()})
                        : ROUTES.REPORT_WITH_ID.getRoute(createdReportID, undefined, undefined, Navigation.getActiveRoute()),
                    {forceReplace: isReportInSearch},
                );
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, isReportInSearch],
    );

    const {openCreateReportConfirmation: openFabCreateReportConfirmation, CreateReportConfirmationModal: FabCreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
    });

    const shouldShowNewWorkspaceButton =
        Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy as OnyxEntry<OnyxTypes.Policy>, !!isOffline, session?.email)) && !isRestrictedPolicyCreation;

    const quickActionAvatars = useMemo(() => {
        if (isValidReport) {
            const avatars = getIcons(quickActionReport, formatPhoneNumber, personalDetails, null, undefined, undefined, undefined, undefined, isReportArchived);
            return avatars.length <= 1 || isPolicyExpenseChat(quickActionReport) ? avatars : avatars.filter((avatar) => avatar.id !== session?.accountID);
        }
        if (!isEmptyObject(policyChatForActivePolicy)) {
            return getIcons(policyChatForActivePolicy, formatPhoneNumber, personalDetails, null, undefined, undefined, undefined, undefined, isReportArchived);
        }
        return [];
        // Policy is needed as a dependency in order to update the shortcut details when the workspace changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personalDetails, session?.accountID, quickActionReport, quickActionPolicy, policyChatForActivePolicy, isReportArchived, isValidReport]);

    const quickActionTitle = useMemo(() => {
        if (isEmptyObject(quickActionReport)) {
            return '';
        }
        if (quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && quickActionAvatars.length > 0) {
            const accountID = quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID;
            const name = getDisplayNameForParticipant({accountID: Number(accountID), shouldUseShortForm: true, formatPhoneNumber}) ?? '';
            return translate('quickAction.paySomeone', {name});
        }
        const titleKey = getQuickActionTitle(quickAction?.action ?? ('' as QuickActionName));
        return titleKey ? translate(titleKey) : '';
    }, [quickAction?.action, translate, quickActionAvatars, quickActionReport, formatPhoneNumber]);

    const hideQABSubtitle = useMemo(() => {
        if (!isValidReport) {
            return true;
        }
        if (quickActionAvatars.length === 0) {
            return false;
        }
        const displayName = personalDetails?.[quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID]?.firstName ?? '';
        return quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && displayName.length === 0;
    }, [isValidReport, quickActionAvatars, personalDetails, quickAction?.action]);

    const quickActionSubtitle = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return !hideQABSubtitle ? (getReportName(quickActionReport, quickActionPolicy, undefined, personalDetails) ?? translate('quickAction.updateDestination')) : '';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hideQABSubtitle, personalDetails, quickAction?.action, quickActionPolicy?.name, quickActionReport, translate]);

    const selectOption = useCallback(
        (onSelected: () => void, shouldRestrictAction: boolean) => {
            if (shouldRestrictAction && quickActionReport?.policyID && shouldRestrictUserBillableActions(quickActionReport.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(quickActionReport.policyID));
                return;
            }
            onSelected();
        },
        [quickActionReport?.policyID],
    );

    const startScan = useCallback(() => {
        interceptAnonymousUser(() => {
            if (shouldRedirectToExpensifyClassic) {
                setModalVisible(true);
                return;
            }

            // Start the scan flow directly
            startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, CONST.IOU.REQUEST_TYPE.SCAN, false, undefined, allTransactionDrafts, true);
        });
    }, [shouldRedirectToExpensifyClassic, allTransactionDrafts, reportID]);

    const startQuickScan = useCallback(() => {
        interceptAnonymousUser(() => {
            if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                return;
            }

            const quickActionReportID = policyChatForActivePolicy?.reportID ?? reportID;
            Tab.setSelectedTab(CONST.TAB.IOU_REQUEST_TYPE, CONST.IOU.REQUEST_TYPE.SCAN);
            startMoneyRequest(CONST.IOU.TYPE.CREATE, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, !!policyChatForActivePolicy?.reportID, undefined, allTransactionDrafts, true);
        });
    }, [policyChatForActivePolicy?.policyID, policyChatForActivePolicy?.reportID, reportID, allTransactionDrafts]);

    /**
     * Check if LHN status changed from active to inactive.
     * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
     */
    const didScreenBecomeInactive = useCallback(
        (): boolean =>
            // When any other page is opened over LHN
            !isFocused && prevIsFocused,
        [isFocused, prevIsFocused],
    );

    /**
     * Method called when we click the floating action button
     */
    const showCreateMenu = useCallback(
        () => {
            if (!isFocused && shouldUseNarrowLayout) {
                return;
            }
            setIsCreateMenuActive(true);
            onShowCreateMenu?.();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isFocused, shouldUseNarrowLayout],
    );

    /**
     * Method called either when:
     * - Pressing the floating action button to open the CreateMenu modal
     * - Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    const hideCreateMenu = useCallback(
        () => {
            if (!isCreateMenuActive) {
                return;
            }
            setIsCreateMenuActive(false);
            onHideCreateMenu?.();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCreateMenuActive],
    );

    useEffect(() => {
        if (!didScreenBecomeInactive()) {
            return;
        }

        // Hide menu manually when other pages are opened using shortcut key
        hideCreateMenu();
    }, [didScreenBecomeInactive, hideCreateMenu]);

    useImperativeHandle(ref, () => ({
        hideCreateMenu() {
            hideCreateMenu();
        },
    }));

    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
        } else {
            showCreateMenu();
        }
    };

    const expenseMenuItems = useMemo((): PopoverMenuItem[] => {
        return [
            {
                icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons),
                text: translate('iou.createExpense'),
                testID: 'create-expense',
                shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        if (shouldRedirectToExpensifyClassic) {
                            setModalVisible(true);
                            return;
                        }
                        startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                    }),
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE,
            },
        ];
    }, [translate, shouldRedirectToExpensifyClassic, shouldUseNarrowLayout, allTransactionDrafts, reportID, icons]);

    const quickActionMenuItems = useMemo(() => {
        // Define common properties in baseQuickAction
        const baseQuickAction = {
            label: translate('quickAction.header'),
            labelStyle: [styles.pt3, styles.pb2],
            isLabelHoverable: false,
            numberOfLinesDescription: 1,
            tooltipAnchorAlignment: {
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            },
            shouldTeleportPortalToModalLayer: true,
        };

        if (quickAction?.action && quickActionReport) {
            if (!isQuickActionAllowed(quickAction, quickActionReport, quickActionPolicy, isReportArchived, isRestrictedToPreferredPolicy)) {
                return [];
            }
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    if (quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    const targetAccountPersonalDetails = {
                        ...personalDetails?.[quickAction.targetAccountID ?? CONST.DEFAULT_NUMBER_ID],
                        accountID: quickAction.targetAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    };

                    navigateToQuickAction({
                        isValidReport,
                        quickAction,
                        selectOption,
                        lastDistanceExpenseType,
                        targetAccountPersonalDetails,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        isFromFloatingActionButton: true
                    });
                });
            };
            return [
                {
                    ...baseQuickAction,
                    icon: getQuickActionIcon(icons, quickAction?.action),
                    text: quickActionTitle,
                    rightIconAccountID: quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID,
                    description: quickActionSubtitle,
                    onSelected,
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    rightIconReportID: quickActionReport?.reportID,
                    sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION,
                },
            ];
        }
        if (!isEmptyObject(policyChatForActivePolicy)) {
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                        return;
                    }

                    const quickActionReportID = policyChatForActivePolicy?.reportID || reportID;
                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, true, undefined, allTransactionDrafts, true);
                });
            };

            return [
                {
                    ...baseQuickAction,
                    icon: icons.ReceiptScan,
                    text: translate('quickAction.scanReceipt'),
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    description: getReportName(policyChatForActivePolicy),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected,
                    rightIconReportID: policyChatForActivePolicy?.reportID,
                    sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.QUICK_ACTION,
                },
            ];
        }

        return [];
    }, [
        icons,
        translate,
        styles.pt3,
        styles.pb2,
        quickAction,
        policyChatForActivePolicy,
        quickActionReport,
        quickActionPolicy,
        isReportArchived,
        isRestrictedToPreferredPolicy,
        quickActionTitle,
        quickActionAvatars,
        quickActionSubtitle,
        shouldUseNarrowLayout,
        isDelegateAccessRestricted,
        isValidReport,
        selectOption,
        lastDistanceExpenseType,
        personalDetails,
        currentUserPersonalDetails.accountID,
        showDelegateNoAccessModal,
        reportID,
        allTransactionDrafts,
    ]);

    const isTravelEnabled = useMemo(() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(activePolicy)) {
            return false;
        }

        const isPolicyProvisioned = activePolicy?.travelSettings?.spotnanaCompanyID ?? activePolicy?.travelSettings?.associatedTravelDomainAccountID;

        return activePolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned);
    }, [activePolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings?.hasAcceptedTerms]);

    const openTravel = useCallback(() => {
        if (isTravelEnabled) {
            openTravelDotLink(activePolicy?.id);
            return;
        }
        Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicy?.id));
    }, [activePolicy?.id, isTravelEnabled]);

    const menuItems = [
        ...expenseMenuItems,
        {
            icon: icons.Location,
            text: translate('iou.trackDistance'),
            shouldCallAfterModalHide: shouldUseNarrowLayout,
            onSelected: () => {
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        setModalVisible(true);
                        return;
                    }
                    // Start the flow to start tracking a distance request
                    startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, lastDistanceExpenseType, undefined, undefined, true);
                });
            },
            sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE,
        },
        ...(shouldShowCreateReportOption
            ? [
                  {
                      icon: icons.Document,
                      text: translate('report.newReport.createReport'),
                      shouldCallAfterModalHide: shouldUseNarrowLayout,
                      onSelected: () => {
                          interceptAnonymousUser(() => {
                              if (shouldRedirectToExpensifyClassic) {
                                  setModalVisible(true);
                                  return;
                              }

                              const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                              if (!workspaceIDForReportCreation || (shouldRestrictUserBillableActions(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)) {
                                  // If we couldn't guess the workspace to create the report, or a guessed workspace is past it's grace period and we have other workspaces to choose from
                                  Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                                  return;
                              }

                              if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation)) {
                                  // Check if empty report confirmation should be shown
                                  if (shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy) {
                                      openFabCreateReportConfirmation();
                                  } else {
                                      handleCreateWorkspaceReport(false);
                                  }
                                  return;
                              }

                              Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                          });
                      },
                      sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.CREATE_REPORT,
                  },
              ]
            : []),
        {
            icon: icons.ChatBubble,
            text: translate('sidebarScreen.fabNewChat'),
            shouldCallAfterModalHide: shouldUseNarrowLayout,
            onSelected: () => interceptAnonymousUser(startNewChat),
            sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.START_CHAT,
        },
        ...(canSendInvoice
            ? [
                  {
                      icon: icons.InvoiceGeneric,
                      text: translate('workspace.invoices.sendInvoice'),
                      shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
                      onSelected: () =>
                          interceptAnonymousUser(() => {
                              if (shouldRedirectToExpensifyClassic) {
                                  setModalVisible(true);
                                  return;
                              }

                              startMoneyRequest(CONST.IOU.TYPE.INVOICE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                          }),
                      sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.SEND_INVOICE,
                  },
              ]
            : []),
        ...(activePolicy?.isTravelEnabled
            ? [
                  {
                      icon: icons.Suitcase,
                      text: translate('travel.bookTravel'),
                      rightIcon: isTravelEnabled && shouldOpenTravelDotLinkWeb() ? icons.NewWindow : undefined,
                      onSelected: () => interceptAnonymousUser(() => openTravel()),
                      sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.BOOK_TRAVEL,
                  },
              ]
            : []),
        ...(!hasSeenTour
            ? [
                  {
                      icon: icons.Binoculars,
                      iconStyles: styles.popoverIconCircle,
                      iconFill: theme.icon,
                      text: translate('testDrive.quickAction.takeATwoMinuteTestDrive'),
                      onSelected: () => interceptAnonymousUser(() => startTestDrive(introSelected, tryNewDot?.hasBeenAddedToNudgeMigration ?? false, isUserPaidPolicyMember)),
                      sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.TEST_DRIVE,
                  },
              ]
            : []),
        ...(!isLoading && shouldShowNewWorkspaceButton
            ? [
                  {
                      displayInDefaultIconColor: true,
                      contentFit: 'contain' as ImageContentFit,
                      icon: icons.NewWorkspace,
                      iconWidth: variables.w46,
                      iconHeight: variables.h40,
                      text: translate('workspace.new.newWorkspace'),
                      description: translate('workspace.new.getTheExpensifyCardAndMore'),
                      shouldCallAfterModalHide: shouldUseNarrowLayout,
                      onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                      sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.NEW_WORKSPACE,
                  },
              ]
            : []),
        ...quickActionMenuItems,
    ];

    return (
        <View style={[styles.justifyContentCenter, styles.flexGrow1, styles.gap3, shouldUseNarrowLayout ? styles.w100 : styles.pv4]}>
            {FabCreateReportConfirmationModal}
            <PopoverMenu
                onClose={hideCreateMenu}
                shouldEnableMaxHeight={false}
                isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
                animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
                animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
                menuItems={menuItems.map((item) => {
                    return {
                        ...item,
                        onSelected: () => {
                            if (!item.onSelected) {
                                return;
                            }
                            navigateAfterInteraction(item.onSelected);
                        },
                    };
                })}
                anchorRef={fabRef}
            />
            <ConfirmModal
                prompt={translate('sidebarScreen.redirectToExpensifyClassicModal.description')}
                isVisible={modalVisible}
                onConfirm={() => {
                    setModalVisible(false);
                    if (CONFIG.IS_HYBRID_APP) {
                        closeReactNativeApp({shouldSetNVP: true});
                        return;
                    }
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                }}
                onCancel={() => setModalVisible(false)}
                title={translate('sidebarScreen.redirectToExpensifyClassicModal.title')}
                confirmText={translate('exitSurvey.goToExpensifyClassic')}
                cancelText={translate('common.cancel')}
            />
            {!shouldUseNarrowLayout && (
                <FloatingReceiptButton
                    accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
                    role={CONST.ROLE.BUTTON}
                    onPress={startQuickScan}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_RECEIPT_BUTTON}
                />
            )}
            <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={fabRef}
                onPress={toggleCreateMenu}
                onLongPress={startScan}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            />
        </View>
    );
}

export default FloatingActionButtonAndPopover;

export type {PolicySelector};
