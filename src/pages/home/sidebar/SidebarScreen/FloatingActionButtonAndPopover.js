import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import withNavigation from '@components/withNavigation';
import withNavigationFocus from '@components/withNavigationFocus';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        role: policy.role,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
    };

const getQuickActionIcon = (action) => {
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

const getQuickActionTitle = (action) => {
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
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return 'quickAction.sendMoney';
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return 'quickAction.assignTask';
        default:
            return '';
    }
};

const propTypes = {
    ...windowDimensionsPropTypes,

    /* Callback function when the menu is shown */
    onShowCreateMenu: PropTypes.func,

    /* Callback function before the menu is hidden */
    onHideCreateMenu: PropTypes.func,

    /** The list of policies the user has access to. */
    allPolicies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** Indicated whether the report data is loading */
    isLoading: PropTypes.bool,

    /** Forwarded ref to FloatingActionButtonAndPopover */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    /** Information on the last taken action to display as Quick Action */
    quickAction: PropTypes.shape({
        action: PropTypes.string,
        chatReportID: PropTypes.string,
        targetAccountID: PropTypes.number,
        isFirstQuickAction: PropTypes.bool,
    }),

    /** Personal details of all the users */
    personalDetails: personalDetailsPropType,

    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }).isRequired,
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    allPolicies: {},
    isLoading: false,
    innerRef: null,
    quickAction: null,
    personalDetails: {},
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 * @param {Object} props
 * @returns {JSX.Element}
 */
function FloatingActionButtonAndPopover(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef(null);
    const {canUseTrackExpense} = usePermissions();

    const prevIsFocused = usePrevious(props.isFocused);

    const quickActionReport = useMemo(() => (props.quickAction ? ReportUtils.getReport(props.quickAction.chatReportID) : 0), [props.quickAction]);

    const quickActionAvatars = useMemo(() => {
        if (quickActionReport) {
            const avatars = ReportUtils.getIcons(quickActionReport, props.personalDetails);
            return avatars.length <= 1 || ReportUtils.isPolicyExpenseChat(quickActionReport) ? avatars : _.filter(avatars, (avatar) => avatar.id !== props.session.accountID);
        }
        return [];
    }, [props.personalDetails, props.session.accountID, quickActionReport]);

    const navigateToQuickAction = () => {
        switch (props.quickAction.action) {
            case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
                IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST, props.quickAction.chatReportID, CONST.IOU.REQUEST_TYPE.MANUAL);
                return;
            case CONST.QUICK_ACTIONS.REQUEST_SCAN:
                IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST, props.quickAction.chatReportID, CONST.IOU.REQUEST_TYPE.SCAN);
                return;
            case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
                IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST, props.quickAction.chatReportID, CONST.IOU.REQUEST_TYPE.DISTANCE);
                return;
            case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, props.quickAction.chatReportID, CONST.IOU.REQUEST_TYPE.MANUAL);
                return;
            case CONST.QUICK_ACTIONS.SPLIT_SCAN:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, props.quickAction.chatReportID, CONST.IOU.REQUEST_TYPE.SCAN);
                return;
            case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, props.quickAction.chatReportID, CONST.IOU.REQUEST_TYPE.DISTANCE);
                return;
            case CONST.QUICK_ACTIONS.SEND_MONEY:
                IOU.startMoneyRequest(CONST.IOU.TYPE.SEND, props.quickAction.chatReportID);
                return;
            case CONST.QUICK_ACTIONS.ASSIGN_TASK:
                Task.clearOutTaskInfoAndNavigate(props.quickAction.chatReportID, quickActionReport, _.get(props.quickAction, 'targetAccountID', 0));
                return;
            default:
                return '';
        }
    };

    /**
     * Check if LHN status changed from active to inactive.
     * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
     *
     * @param {Object} prevProps
     * @return {Boolean}
     */
    const didScreenBecomeInactive = useCallback(
        () =>
            // When any other page is opened over LHN
            !props.isFocused && prevIsFocused,
        [props.isFocused, prevIsFocused],
    );

    /**
     * Method called when we click the floating action button
     */
    const showCreateMenu = useCallback(
        () => {
            if (!props.isFocused && props.isSmallScreenWidth) {
                return;
            }
            setIsCreateMenuActive(true);
            props.onShowCreateMenu();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.isFocused, props.isSmallScreenWidth],
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
            props.onHideCreateMenu();
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

    useImperativeHandle(props.innerRef, () => ({
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
                isVisible={isCreateMenuActive && (!props.isSmallScreenWidth || props.isFocused)}
                anchorPosition={styles.createMenuPositionSidebar(props.windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!props.isSmallScreenWidth}
                menuItems={[
                    {
                        icon: Expensicons.ChatBubble,
                        text: translate('sidebarScreen.fabNewChat'),
                        onSelected: () => interceptAnonymousUser(Report.startNewChat),
                    },
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
                                              ReportUtils.findSelfDMReportID() || ReportUtils.generateReportID(),
                                          ),
                                      ),
                              },
                          ]
                        : []),
                    {
                        icon: Expensicons.Task,
                        text: translate('newTaskPage.assignTask'),
                        onSelected: () => interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                    },
                    {
                        icon: Expensicons.Heart,
                        text: translate('sidebarScreen.saveTheWorld'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.TEACHERS_UNITE)),
                    },
                    ...(!props.isLoading && !Policy.hasActiveChatEnabledPolicies(props.allPolicies)
                        ? [
                              {
                                  displayInDefaultIconColor: true,
                                  contentFit: 'contain',
                                  icon: Expensicons.NewWorkspace,
                                  iconWidth: 46,
                                  iconHeight: 40,
                                  text: translate('workspace.new.newWorkspace'),
                                  description: translate('workspace.new.getTheExpensifyCardAndMore'),
                                  onSelected: () => interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()),
                              },
                          ]
                        : []),
                    ...(props.quickAction && props.quickAction.action
                        ? [
                              {
                                  icon: getQuickActionIcon(props.quickAction.action),
                                  text: translate(getQuickActionTitle(props.quickAction.action)),
                                  label: translate('quickAction.shortcut'),
                                  isLabelHoverable: false,
                                  floatRightAvatars: quickActionAvatars,
                                  floatRightAvatarSize: CONST.AVATAR_SIZE.SMALL,
                                  description: ReportUtils.getReportName(quickActionReport),
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

FloatingActionButtonAndPopover.propTypes = propTypes;
FloatingActionButtonAndPopover.defaultProps = defaultProps;
FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';

const FloatingActionButtonAndPopoverWithRef = forwardRef((props, ref) => (
    <FloatingActionButtonAndPopover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

FloatingActionButtonAndPopoverWithRef.displayName = 'FloatingActionButtonAndPopoverWithRef';

export default compose(
    withNavigation,
    withNavigationFocus,
    withWindowDimensions,
    withOnyx({
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
    }),
)(FloatingActionButtonAndPopoverWithRef);
