import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useIsFocused} from '@react-navigation/native';
import type {ImageContentFit} from 'expo-image';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import ConfirmModal from '@components/ConfirmModal';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {startMoneyRequest} from '@libs/actions/IOU';
import {openExternalLink, openOldDotLink} from '@libs/actions/Link';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import {createNewReport, startNewChat} from '@libs/actions/Report';
import {isAnonymousUser} from '@libs/actions/Session';
import {canActionTask as canActionTaskUtils, canModifyTask as canModifyTaskUtils, completeTask} from '@libs/actions/Task';
import {setSelfTourViewed} from '@libs/actions/Welcome';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import {hasSeenTourSelector} from '@libs/onboardingSelectors';
import {
    areAllGroupPoliciesExpenseChatDisabled,
    canSendInvoice as canSendInvoicePolicyUtils,
    getGroupPaidPoliciesWithExpenseChatEnabled,
    isPaidGroupPolicy,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {canCreateRequest, generateReportID, getDisplayNameForParticipant, getIcons, getReportName, getWorkspaceChats, isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getNavatticURL} from '@libs/TourUtils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'role' | 'isPolicyExpenseChatEnabled' | 'pendingAction' | 'avatarURL' | 'name' | 'id' | 'areInvoicesEnabled'>;

type FloatingActionButtonAndPopoverProps = {
    /* Callback function when the menu is shown */
    onShowCreateMenu?: () => void;

    /* Callback function before the menu is hidden */
    onHideCreateMenu?: () => void;

    /* If the tooltip is allowed to be shown */
    isTooltipAllowed: boolean;
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

const getQuickActionIcon = (action: QuickActionName): React.FC<SvgProps> => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
            return getIconForAction(CONST.IOU.TYPE.REQUEST);
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
            return Expensicons.ReceiptScan;
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
            return Expensicons.Car;
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return Expensicons.CalendarSolid;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return getIconForAction(CONST.IOU.TYPE.SPLIT);
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return getIconForAction(CONST.IOU.TYPE.SEND);
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return Expensicons.Task;
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            return Expensicons.Car;
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
            return getIconForAction(CONST.IOU.TYPE.TRACK);
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return Expensicons.ReceiptScan;
        default:
            return Expensicons.MoneyCircle;
    }
};

const getIouType = (action: QuickActionName) => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return CONST.IOU.TYPE.SUBMIT;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return CONST.IOU.TYPE.SPLIT;
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return CONST.IOU.TYPE.TRACK;
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return CONST.IOU.TYPE.PAY;
        default:
            return undefined;
    }
};

const getQuickActionTitle = (action: QuickActionName): TranslationPaths => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
            return 'quickAction.requestMoney';
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return 'quickAction.scanReceipt';
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            return 'quickAction.recordDistance';
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return 'quickAction.perDiem';
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
            return 'quickAction.splitBill';
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
            return 'quickAction.splitScan';
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return 'quickAction.splitDistance';
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return 'quickAction.paySomeone';
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return 'quickAction.assignTask';
        default:
            return '' as TranslationPaths;
    }
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover({onHideCreateMenu, onShowCreateMenu, isTooltipAllowed}: FloatingActionButtonAndPopoverProps, ref: ForwardedRef<FloatingActionButtonAndPopoverRef>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [quickActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${quickAction?.chatReportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${quickActionReport?.reportID}`);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const policyChatForActivePolicy = useMemo(() => {
        if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
            return {} as OnyxTypes.Report;
        }
        const policyChatsForActivePolicy = getWorkspaceChats(`${activePolicyID ?? CONST.DEFAULT_NUMBER_ID}`, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], allReports);
        return policyChatsForActivePolicy.length > 0 ? policyChatsForActivePolicy.at(0) : ({} as OnyxTypes.Report);
    }, [activePolicy, activePolicyID, session?.accountID, allReports]);
    const [quickActionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${quickActionReport?.policyID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (c) => mapOnyxCollectionItems(c, policySelector)});

    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const {isOffline} = useNetwork();

    const {canUseSpotnanaTravel, canUseTableReportView} = usePermissions();
    const canSendInvoice = useMemo(() => canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email), [allPolicies, session?.email]);
    const isValidReport = !(isEmptyObject(quickActionReport) || isArchivedReport(reportNameValuePairs));
    const {environment} = useEnvironment();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const navatticURL = getNavatticURL(environment, introSelected?.choice);
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });

    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);

    const {renderProductTrainingTooltip, hideProductTrainingTooltip, shouldShowProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.QUICK_ACTION_BUTTON,
        isCreateMenuActive && (!shouldUseNarrowLayout || isFocused),
    );

    const groupPoliciesWithChatEnabled = useMemo(() => getGroupPaidPoliciesWithExpenseChatEnabled(allPolicies as OnyxCollection<OnyxTypes.Policy>), [allPolicies]);

    /**
     * There are scenarios where users who have not yet had their group workspace-chats in NewDot (isPolicyExpenseChatEnabled). In those scenarios, things can get confusing if they try to submit/track expenses. To address this, we block them from Creating, Tracking, Submitting expenses from NewDot if they are:
     * 1. on at least one group policy
     * 2. none of the group policies they are a member of have isPolicyExpenseChatEnabled=true
     */
    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {});
    }, [allPolicies]);

    const shouldShowNewWorkspaceButton = Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy as OnyxEntry<OnyxTypes.Policy>, !!isOffline, session?.email));

    const quickActionAvatars = useMemo(() => {
        if (isValidReport) {
            const avatars = getIcons(quickActionReport, personalDetails);
            return avatars.length <= 1 || isPolicyExpenseChat(quickActionReport) ? avatars : avatars.filter((avatar) => avatar.id !== session?.accountID);
        }
        if (!isEmptyObject(policyChatForActivePolicy)) {
            return getIcons(policyChatForActivePolicy, personalDetails);
        }
        return [];
        // Policy is needed as a dependency in order to update the shortcut details when the workspace changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [personalDetails, session?.accountID, quickActionReport, quickActionPolicy, policyChatForActivePolicy]);

    const quickActionTitle = useMemo(() => {
        if (isEmptyObject(quickActionReport)) {
            return '';
        }
        if (quickAction?.action === CONST.QUICK_ACTIONS.SEND_MONEY && quickActionAvatars.length > 0) {
            const accountID = quickActionAvatars.at(0)?.id ?? CONST.DEFAULT_NUMBER_ID;
            const name = getDisplayNameForParticipant({accountID: Number(accountID), shouldUseShortForm: true}) ?? '';
            return translate('quickAction.paySomeone', {name});
        }
        const titleKey = getQuickActionTitle(quickAction?.action ?? ('' as QuickActionName));
        return titleKey ? translate(titleKey) : '';
    }, [quickAction, translate, quickActionAvatars, quickActionReport]);

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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
                icon: getIconForAction(CONST.IOU.TYPE.CREATE),
                text: translate('iou.createExpense'),
                shouldCallAfterModalHide: shouldRedirectToExpensifyClassic,
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        if (shouldRedirectToExpensifyClassic) {
                            setModalVisible(true);
                            return;
                        }
                        startMoneyRequest(
                            CONST.IOU.TYPE.CREATE,
                            // When starting to create an expense from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                            // for all of the routes in the creation flow.
                            generateReportID(),
                        );
                    }),
            },
        ];
    }, [translate, shouldRedirectToExpensifyClassic]);

    const quickActionMenuItems = useMemo(() => {
        // Define common properties in baseQuickAction
        const baseQuickAction = {
            label: translate('quickAction.header'),
            labelStyle: [styles.pt3, styles.pb2],
            isLabelHoverable: false,
            floatRightAvatars: quickActionAvatars,
            floatRightAvatarSize: CONST.AVATAR_SIZE.SMALL,
            numberOfLinesDescription: 1,
            tooltipAnchorAlignment: {
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            },
            tooltipShiftHorizontal: variables.quickActionTooltipShiftHorizontal,
            tooltipShiftVertical: styles.popoverMenuItem.paddingVertical / 2,
            renderTooltipContent: renderProductTrainingTooltip,
            tooltipWrapperStyle: styles.productTrainingTooltipWrapper,
            shouldRenderTooltip: shouldShowProductTrainingTooltip,
            shouldTeleportPortalToModalLayer: true,
        };

        if (quickAction?.action) {
            const iouType = getIouType(quickAction?.action);
            if (!!iouType && !canCreateRequest(quickActionReport, quickActionPolicy, iouType)) {
                return [];
            }
            if (quickAction?.action === CONST.QUICK_ACTIONS.PER_DIEM && !quickActionPolicy?.arePerDiemRatesEnabled) {
                return [];
            }
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    hideProductTrainingTooltip();
                    navigateToQuickAction(isValidReport, `${quickActionReport?.reportID ?? CONST.DEFAULT_NUMBER_ID}`, quickAction, selectOption);
                });
            };
            return [
                {
                    ...baseQuickAction,
                    icon: getQuickActionIcon(quickAction?.action),
                    text: quickActionTitle,
                    description: !hideQABSubtitle ? getReportName(quickActionReport) ?? translate('quickAction.updateDestination') : '',
                    onSelected,
                    onEducationTooltipPress: () => {
                        hideCreateMenu();
                        onSelected();
                    },
                    shouldShowSubscriptRightAvatar: isPolicyExpenseChat(quickActionReport),
                },
            ];
        }
        if (!isEmptyObject(policyChatForActivePolicy)) {
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    hideProductTrainingTooltip();
                    if (policyChatForActivePolicy?.policyID && shouldRestrictUserBillableActions(policyChatForActivePolicy.policyID)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyChatForActivePolicy.policyID));
                        return;
                    }

                    const quickActionReportID = policyChatForActivePolicy?.reportID || generateReportID();
                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, quickActionReportID, CONST.IOU.REQUEST_TYPE.SCAN, true);
                });
            };

            return [
                {
                    ...baseQuickAction,
                    icon: Expensicons.ReceiptScan,
                    text: translate('quickAction.scanReceipt'),
                    description: getReportName(policyChatForActivePolicy),
                    onSelected,
                    onEducationTooltipPress: () => {
                        hideCreateMenu();
                        onSelected();
                    },
                    shouldShowSubscriptRightAvatar: true,
                },
            ];
        }

        return [];
    }, [
        translate,
        styles.pt3,
        styles.pb2,
        styles.popoverMenuItem.paddingVertical,
        styles.productTrainingTooltipWrapper,
        quickActionAvatars,
        renderProductTrainingTooltip,
        shouldShowProductTrainingTooltip,
        quickAction,
        policyChatForActivePolicy,
        quickActionReport,
        quickActionPolicy,
        quickActionTitle,
        hideQABSubtitle,
        hideProductTrainingTooltip,
        isValidReport,
        selectOption,
        hideCreateMenu,
    ]);

    const viewTourTaskReportID = introSelected?.viewTour;
    const [viewTourTaskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourTaskReportID}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const canModifyTask = canModifyTaskUtils(viewTourTaskReport, currentUserPersonalDetails.accountID);
    const canActionTask = canActionTaskUtils(viewTourTaskReport, currentUserPersonalDetails.accountID);

    const menuItems = [
        ...expenseMenuItems,
        ...(canUseTableReportView
            ? [
                  {
                      icon: Expensicons.Document,
                      text: translate('report.newReport.createReport'),
                      onSelected: () => {
                          interceptAnonymousUser(() => {
                              if (groupPoliciesWithChatEnabled.length === 0) {
                                  setModalVisible(true);
                                  return;
                              }

                              // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                              if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && isPaidGroupPolicy(activePolicy)) {
                                  const createdReportID = createNewReport(currentUserPersonalDetails, activePolicyID);
                                  Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
                                  return;
                              }

                              if (groupPoliciesWithChatEnabled.length === 1) {
                                  const createdReportID = createNewReport(currentUserPersonalDetails, groupPoliciesWithChatEnabled.at(0)?.id);
                                  Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
                                  return;
                              }

                              // If the user's default workspace is personal and the user has more than one group workspace which is paid and has chat enabled, we need to redirect them to the workspace selection screen
                              Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION);
                          });
                      },
                  },
              ]
            : []),
        {
            icon: Expensicons.ChatBubble,
            text: translate('sidebarScreen.fabNewChat'),
            onSelected: () => interceptAnonymousUser(startNewChat),
        },
        ...(canSendInvoice
            ? [
                  {
                      icon: Expensicons.InvoiceGeneric,
                      text: translate('workspace.invoices.sendInvoice'),
                      shouldCallAfterModalHide: shouldRedirectToExpensifyClassic,
                      onSelected: () =>
                          interceptAnonymousUser(() => {
                              if (shouldRedirectToExpensifyClassic) {
                                  setModalVisible(true);
                                  return;
                              }

                              startMoneyRequest(
                                  CONST.IOU.TYPE.INVOICE,
                                  // When starting to create an invoice from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                                  // for all of the routes in the creation flow.
                                  generateReportID(),
                              );
                          }),
                  },
              ]
            : []),
        ...(canUseSpotnanaTravel
            ? [
                  {
                      icon: Expensicons.Suitcase,
                      text: translate('travel.bookTravel'),
                      onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS)),
                  },
              ]
            : []),
        ...(!hasSeenTour
            ? [
                  {
                      icon: Expensicons.Binoculars,
                      iconStyles: styles.popoverIconCircle,
                      iconFill: theme.icon,
                      text: translate('tour.takeATwoMinuteTour'),
                      description: translate('tour.exploreExpensify'),
                      onSelected: () => {
                          openExternalLink(navatticURL);
                          setSelfTourViewed(isAnonymousUser());
                          if (viewTourTaskReport && canModifyTask && canActionTask) {
                              completeTask(viewTourTaskReport);
                          }
                      },
                  },
              ]
            : []),
        ...(!isLoading && shouldShowNewWorkspaceButton
            ? [
                  {
                      displayInDefaultIconColor: true,
                      contentFit: 'contain' as ImageContentFit,
                      icon: Expensicons.NewWorkspace,
                      iconWidth: variables.w46,
                      iconHeight: variables.h40,
                      text: translate('workspace.new.newWorkspace'),
                      description: translate('workspace.new.getTheExpensifyCardAndMore'),
                      onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                  },
              ]
            : []),
        ...quickActionMenuItems,
    ];

    return (
        <View style={styles.flexGrow1}>
            <PopoverMenu
                onClose={hideCreateMenu}
                shouldEnableMaxHeight={false}
                isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
                animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
                animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
                shouldUseNewModal
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
                withoutOverlay
                anchorRef={fabRef}
            />
            <ConfirmModal
                prompt={translate('sidebarScreen.redirectToExpensifyClassicModal.description')}
                isVisible={modalVisible}
                onConfirm={() => {
                    setModalVisible(false);
                    if (CONFIG.IS_HYBRID_APP) {
                        HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: true});
                        setRootStatusBarEnabled(false);
                        return;
                    }
                    openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                }}
                onCancel={() => setModalVisible(false)}
                title={translate('sidebarScreen.redirectToExpensifyClassicModal.title')}
                confirmText={translate('exitSurvey.goToExpensifyClassic')}
                cancelText={translate('common.cancel')}
            />
            <FloatingActionButton
                isTooltipAllowed={isTooltipAllowed}
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={fabRef}
                onPress={toggleCreateMenu}
            />
        </View>
    );
}

FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';

export default forwardRef(FloatingActionButtonAndPopover);

export type {PolicySelector};
