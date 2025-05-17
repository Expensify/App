import HybridAppModule from '@expensify/react-native-hybrid-app';
import {useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import type {ImageContentFit} from 'expo-image';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
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
import {openExternalLink, openOldDotLink, openTravelDotLink} from '@libs/actions/Link';
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
import {getQuickActionIcon, getQuickActionTitle, isQuickActionAllowed} from '@libs/QuickActionUtils';
import {generateReportID, getDisplayNameForParticipant, getIcons, getReportName, getWorkspaceChats, isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getNavatticURL} from '@libs/TourUtils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
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

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover({onHideCreateMenu, onShowCreateMenu, isTooltipAllowed}: FloatingActionButtonAndPopoverProps, ref: ForwardedRef<FloatingActionButtonAndPopoverRef>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [quickActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${quickAction?.chatReportID}`, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${quickActionReport?.reportID}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const policyChatForActivePolicy = useMemo(() => {
        if (isEmptyObject(activePolicy) || !activePolicy?.isPolicyExpenseChatEnabled) {
            return {} as OnyxTypes.Report;
        }
        const policyChatsForActivePolicy = getWorkspaceChats(activePolicyID, [session?.accountID ?? CONST.DEFAULT_NUMBER_ID], allReports);
        return policyChatsForActivePolicy.length > 0 ? policyChatsForActivePolicy.at(0) : ({} as OnyxTypes.Report);
    }, [activePolicy, activePolicyID, session?.accountID, allReports]);
    const [quickActionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${quickActionReport?.policyID}`, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (c) => mapOnyxCollectionItems(c, policySelector), canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const {isOffline} = useNetwork();
    const {isBlockedFromSpotnanaTravel} = usePermissions();
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.primaryLogin, canBeMissing: true});
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS, {canBeMissing: true});

    const {canUseSpotnanaTravel, canUseTableReportView} = usePermissions();
    const canSendInvoice = useMemo(() => canSendInvoicePolicyUtils(allPolicies as OnyxCollection<OnyxTypes.Policy>, session?.email), [allPolicies, session?.email]);
    const isValidReport = !(isEmptyObject(quickActionReport) || isArchivedReport(reportNameValuePairs));
    const {environment} = useEnvironment();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const navatticURL = getNavatticURL(environment, introSelected?.choice);
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
        canBeMissing: true,
    });

    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);

    const groupPoliciesWithChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled();

    /**
     * There are scenarios where users who have not yet had their group workspace-chats in NewDot (isPolicyExpenseChatEnabled). In those scenarios, things can get confusing if they try to submit/track expenses. To address this, we block them from Creating, Tracking, Submitting expenses from NewDot if they are:
     * 1. on at least one group policy
     * 2. none of the group policies they are a member of have isPolicyExpenseChatEnabled=true
     */
    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {});
    }, [allPolicies]);
    const shouldShowCreateReportOption = canUseTableReportView && (shouldRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0);

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

    const quickActionSubtitle = useMemo(() => {
        if (quickAction?.action === CONST.QUICK_ACTIONS.CREATE_REPORT) {
            return quickActionPolicy?.name;
        }
        return !hideQABSubtitle ? getReportName(quickActionReport) ?? translate('quickAction.updateDestination') : '';
        // eslint-disable-next-line react-compiler/react-compiler
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
                testID: 'create-expense',
                shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
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
    }, [translate, shouldRedirectToExpensifyClassic, shouldUseNarrowLayout]);

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
            shouldTeleportPortalToModalLayer: true,
        };

        if (quickAction?.action) {
            if (!isQuickActionAllowed(quickAction, quickActionReport, quickActionPolicy)) {
                return [];
            }
            const onSelected = () => {
                interceptAnonymousUser(() => {
                    navigateToQuickAction(isValidReport, quickAction, currentUserPersonalDetails, quickActionPolicy?.id, selectOption);
                });
            };
            return [
                {
                    ...baseQuickAction,
                    icon: getQuickActionIcon(quickAction?.action),
                    text: quickActionTitle,
                    description: quickActionSubtitle,
                    onSelected,
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    shouldShowSubscriptRightAvatar: isPolicyExpenseChat(quickActionReport),
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
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected,
                    shouldShowSubscriptRightAvatar: true,
                },
            ];
        }

        return [];
    }, [
        translate,
        styles.pt3,
        styles.pb2,
        quickActionAvatars,
        quickAction,
        policyChatForActivePolicy,
        quickActionTitle,
        quickActionSubtitle,
        currentUserPersonalDetails,
        quickActionPolicy,
        quickActionReport,
        isValidReport,
        selectOption,
        shouldUseNarrowLayout,
    ]);

    const viewTourTaskReportID = introSelected?.viewTour;
    const [viewTourTaskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourTaskReportID}`, {canBeMissing: true});

    const canModifyTask = canModifyTaskUtils(viewTourTaskReport, currentUserPersonalDetails.accountID);
    const canActionTask = canActionTaskUtils(viewTourTaskReport, currentUserPersonalDetails.accountID);

    const isTravelEnabled = useMemo(() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(activePolicy)) {
            return false;
        }

        const isPolicyProvisioned = activePolicy?.travelSettings?.spotnanaCompanyID ?? activePolicy?.travelSettings?.associatedTravelDomainAccountID;

        return activePolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned);
    }, [activePolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings?.hasAcceptedTerms]);

    const openTravel = useCallback(() => {
        if (isTravelEnabled) {
            openTravelDotLink(activePolicy?.id)
                ?.then(() => {})
                ?.catch(() => {
                    Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS);
                });
        } else {
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS);
        }
    }, [activePolicy, isTravelEnabled]);

    const menuItems = [
        ...expenseMenuItems,
        ...(shouldShowCreateReportOption
            ? [
                  {
                      icon: Expensicons.Document,
                      text: translate('report.newReport.createReport'),
                      shouldCallAfterModalHide: shouldUseNarrowLayout,
                      onSelected: () => {
                          interceptAnonymousUser(() => {
                              if (shouldRedirectToExpensifyClassic) {
                                  setModalVisible(true);
                                  return;
                              }

                              let workspaceIDForReportCreation: string | undefined;

                              if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && isPaidGroupPolicy(activePolicy)) {
                                  // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                                  workspaceIDForReportCreation = activePolicyID;
                              } else if (groupPoliciesWithChatEnabled.length === 1) {
                                  // If the user has only one paid group workspace with chat enabled, we create a report with it
                                  workspaceIDForReportCreation = groupPoliciesWithChatEnabled.at(0)?.id;
                              }

                              if (!workspaceIDForReportCreation || (shouldRestrictUserBillableActions(workspaceIDForReportCreation) && groupPoliciesWithChatEnabled.length > 1)) {
                                  // If we counld't guess the workspace to create the report, or a guessed workspace is past it's grace period and we have other workspaces to choose from
                                  Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION);
                                  return;
                              }

                              if (!shouldRestrictUserBillableActions(workspaceIDForReportCreation)) {
                                  const createdReportID = createNewReport(currentUserPersonalDetails, workspaceIDForReportCreation);
                                  Navigation.setNavigationActionToMicrotaskQueue(() => {
                                      Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
                                  });
                              } else {
                                  Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                              }
                          });
                      },
                  },
              ]
            : []),
        {
            icon: Expensicons.ChatBubble,
            text: translate('sidebarScreen.fabNewChat'),
            shouldCallAfterModalHide: shouldUseNarrowLayout,
            onSelected: () => interceptAnonymousUser(startNewChat),
        },
        ...(canSendInvoice
            ? [
                  {
                      icon: Expensicons.InvoiceGeneric,
                      text: translate('workspace.invoices.sendInvoice'),
                      shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
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
                      rightIcon: isTravelEnabled ? Expensicons.NewWindow : undefined,
                      onSelected: () => interceptAnonymousUser(() => openTravel()),
                  },
              ]
            : []),
        ...(!hasSeenTour
            ? [
                  {
                      icon: Expensicons.Binoculars,
                      iconStyles: styles.popoverIconCircle,
                      iconFill: theme.icon,
                      text: translate('testDrive.quickAction.takeATwoMinuteTestDrive'),
                      description: translate('testDrive.quickAction.exploreExpensify'),
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
                      shouldCallAfterModalHide: shouldUseNarrowLayout,
                      onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                  },
              ]
            : []),
        ...quickActionMenuItems,
    ];

    return (
        <View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
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
