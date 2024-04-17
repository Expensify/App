import {useIsFocused} from '@react-navigation/native';
import type {ImageContentFit} from 'expo-image';
import type {ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'role' | 'isPolicyExpenseChatEnabled' | 'pendingAction' | 'avatar' | 'name'>;

type FloatingActionButtonAndPopoverOnyxProps = {
    /** The list of policies the user has access to. */
    allPolicies: OnyxCollection<PolicySelector>;

    /** Whether app is in loading state */
    isLoading: OnyxEntry<boolean>;

    /** Information on the last taken action to display as Quick Action */
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;

    /** The current session */
    session: OnyxEntry<OnyxTypes.Session>;

    /** Personal details of all the users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type FloatingActionButtonAndPopoverProps = FloatingActionButtonAndPopoverOnyxProps & {
    /* Callback function when the menu is shown */
    onShowCreateMenu?: () => void;

    /* Callback function before the menu is hidden */
    onHideCreateMenu?: () => void;
};

type FloatingActionButtonAndPopoverRef = {
    hideCreateMenu: () => void;
};

const policySelector = (policy: OnyxEntry<OnyxTypes.Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        role: policy.role,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
        avatar: policy.avatar,
        name: policy.name,
    }) as PolicySelector;

const getQuickActionIcon = (action: QuickActionName): React.FC<SvgProps> => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
            return Expensicons.MoneyCircle;
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
            return Expensicons.Receipt;
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
            return Expensicons.Car;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return Expensicons.Transfer;
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return Expensicons.Send;
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return Expensicons.Task;
        default:
            return Expensicons.MoneyCircle;
    }
};

const getQuickActionTitle = (action: QuickActionName): TranslationPaths => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
            return 'quickAction.requestMoney';
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
            return 'quickAction.scanReceipt';
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
            return 'quickAction.recordDistance';
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
            return 'quickAction.splitBill';
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
            return 'quickAction.splitScan';
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return 'quickAction.splitDistance';
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
            return 'quickAction.trackManual';
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return 'quickAction.trackScan';
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            return 'quickAction.trackDistance';
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return 'quickAction.sendMoney';
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
function FloatingActionButtonAndPopover(
    {onHideCreateMenu, onShowCreateMenu, isLoading = false, allPolicies, quickAction, session, personalDetails}: FloatingActionButtonAndPopoverProps,
    ref: ForwardedRef<FloatingActionButtonAndPopoverRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const {canUseTrackExpense} = usePermissions();
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const quickActionReport: OnyxEntry<OnyxTypes.Report> = useMemo(() => (quickAction ? ReportUtils.getReport(quickAction.chatReportID) : null), [quickAction]);

    const quickActionPolicy = allPolicies ? allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${quickActionReport?.policyID}`] : undefined;

    const quickActionAvatars = useMemo(() => {
        if (quickActionReport) {
            const avatars = ReportUtils.getIcons(quickActionReport, personalDetails);
            return avatars.length <= 1 || ReportUtils.isPolicyExpenseChat(quickActionReport) ? avatars : avatars.filter((avatar) => avatar.id !== session?.accountID);
        }
        return [];
        // Policy is needed as a dependency in order to update the shortcut details when the workspace changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personalDetails, session?.accountID, quickActionReport, quickActionPolicy]);

    const quickActionTitle = useMemo(() => {
        const titleKey = getQuickActionTitle(quickAction?.action ?? ('' as QuickActionName));
        return titleKey ? translate(titleKey) : '';
    }, [quickAction, translate]);

    const navigateToQuickAction = () => {
        switch (quickAction?.action) {
            case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
                IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.MANUAL);
                break;
            case CONST.QUICK_ACTIONS.REQUEST_SCAN:
                IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.SCAN);
                break;
            case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
                IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.DISTANCE);
                break;
            case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.MANUAL);
                break;
            case CONST.QUICK_ACTIONS.SPLIT_SCAN:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.SCAN);
                break;
            case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.DISTANCE);
                break;
            case CONST.QUICK_ACTIONS.SEND_MONEY:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SEND, quickAction?.chatReportID ?? '');
                break;
            case CONST.QUICK_ACTIONS.ASSIGN_TASK:
                Task.clearOutTaskInfoAndNavigate(quickAction?.chatReportID, quickActionReport, quickAction.targetAccountID ?? 0);
                break;
            case CONST.QUICK_ACTIONS.TRACK_MANUAL:
                IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK_EXPENSE, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.MANUAL);
                break;
            case CONST.QUICK_ACTIONS.TRACK_SCAN:
                IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK_EXPENSE, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.SCAN);
                break;
            case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
                IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK_EXPENSE, quickAction?.chatReportID ?? '', CONST.IOU.REQUEST_TYPE.DISTANCE);
                break;
            default:
        }
    };

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
            if (!isFocused && isSmallScreenWidth) {
                return;
            }
            setIsCreateMenuActive(true);
            onShowCreateMenu?.();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isFocused, isSmallScreenWidth],
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

    return (
        <View style={styles.flexGrow1}>
            <PopoverMenu
                onClose={hideCreateMenu}
                isVisible={isCreateMenuActive && (!isSmallScreenWidth || isFocused)}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!isSmallScreenWidth}
                menuItems={[
                    {
                        icon: Expensicons.ChatBubble,
                        text: translate('sidebarScreen.fabNewChat'),
                        onSelected: () => interceptAnonymousUser(Report.startNewChat),
                    },
                    ...(canUseTrackExpense
                        ? [
                              {
                                  icon: Expensicons.DocumentPlus,
                                  text: translate('iou.trackExpense'),
                                  onSelected: () =>
                                      interceptAnonymousUser(() =>
                                          IOU.startMoneyRequest(
                                              CONST.IOU.TYPE.TRACK_EXPENSE,
                                              // When starting to create a track expense from the global FAB, we need to retrieve selfDM reportID.
                                              // If it doesn't exist, we generate a random optimistic reportID and use it for all of the routes in the creation flow.
                                              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                              ReportUtils.findSelfDMReportID() || ReportUtils.generateReportID(),
                                          ),
                                      ),
                              },
                          ]
                        : []),
                    {
                        icon: Expensicons.MoneyCircle,
                        text: translate('iou.requestMoney'),
                        onSelected: () =>
                            interceptAnonymousUser(() =>
                                IOU.startMoneyRequest(
                                    CONST.IOU.TYPE.REQUEST,
                                    // When starting to create a money request from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                                    // for all of the routes in the creation flow.
                                    ReportUtils.generateReportID(),
                                ),
                            ),
                    },
                    {
                        icon: Expensicons.Send,
                        text: translate('iou.sendMoney'),
                        onSelected: () =>
                            interceptAnonymousUser(() =>
                                IOU.startMoneyRequest(
                                    CONST.IOU.TYPE.SEND,
                                    // When starting to create a send money request from the global FAB, there is not an existing report yet. A random optimistic reportID is generated and used
                                    // for all of the routes in the creation flow.
                                    ReportUtils.generateReportID(),
                                ),
                            ),
                    },
                    {
                        icon: Expensicons.Task,
                        text: translate('newTaskPage.assignTask'),
                        onSelected: () => interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                    },
                    ...(!isLoading && !Policy.hasActiveChatEnabledPolicies(allPolicies)
                        ? [
                              {
                                  displayInDefaultIconColor: true,
                                  contentFit: 'contain' as ImageContentFit,
                                  icon: Expensicons.NewWorkspace,
                                  iconWidth: 46,
                                  iconHeight: 40,
                                  text: translate('workspace.new.newWorkspace'),
                                  description: translate('workspace.new.getTheExpensifyCardAndMore'),
                                  onSelected: () => interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()),
                              },
                          ]
                        : []),
                    ...(quickAction?.action
                        ? [
                              {
                                  icon: getQuickActionIcon(quickAction?.action),
                                  text: quickActionTitle,
                                  label: translate('quickAction.header'),
                                  isLabelHoverable: false,
                                  floatRightAvatars: quickActionAvatars,
                                  floatRightAvatarSize: CONST.AVATAR_SIZE.SMALL,
                                  description: !isEmptyObject(quickActionReport) ? ReportUtils.getReportName(quickActionReport) : '',
                                  numberOfLinesDescription: 1,
                                  onSelected: () => interceptAnonymousUser(() => navigateToQuickAction()),
                                  shouldShowSubscriptRightAvatar: ReportUtils.isPolicyExpenseChat(quickActionReport),
                              },
                          ]
                        : []),
                ]}
                withoutOverlay
                anchorRef={fabRef}
            />
            <FloatingActionButton
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

export default withOnyx<FloatingActionButtonAndPopoverProps & RefAttributes<FloatingActionButtonAndPopoverRef>, FloatingActionButtonAndPopoverOnyxProps>({
    allPolicies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        selector: policySelector,
    },
    isLoading: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
    quickAction: {
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(forwardRef(FloatingActionButtonAndPopover));

export type {PolicySelector};
