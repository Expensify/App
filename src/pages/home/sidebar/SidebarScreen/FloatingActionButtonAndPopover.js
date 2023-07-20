import React, {useState, useEffect, useCallback, useImperativeHandle, forwardRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import NAVIGATORS from '../../../../NAVIGATORS';
import SCREENS from '../../../../SCREENS';
import Permissions from '../../../../libs/Permissions';
import * as Policy from '../../../../libs/actions/Policy';
import * as PolicyUtils from '../../../../libs/PolicyUtils';
import PopoverMenu from '../../../../components/PopoverMenu';
import CONST from '../../../../CONST';
import FloatingActionButton from '../../../../components/FloatingActionButton';
import compose from '../../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import ONYXKEYS from '../../../../ONYXKEYS';
import withNavigation from '../../../../components/withNavigation';
import * as Welcome from '../../../../libs/actions/Welcome';
import withNavigationFocus from '../../../../components/withNavigationFocus';
import * as Task from '../../../../libs/actions/Task';
import * as Session from '../../../../libs/actions/Session';
import * as IOU from '../../../../libs/actions/IOU';
import usePrevious from '../../../../hooks/usePrevious';
import * as App from '../../../../libs/actions/App';

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        role: policy.role,
        pendingAction: policy.pendingAction,
    };

const propTypes = {
    ...withLocalizePropTypes,

    /* Callback function when the menu is shown */
    onShowCreateMenu: PropTypes.func,

    /* Callback function before the menu is hidden */
    onHideCreateMenu: PropTypes.func,

    /** The list of policies the user has access to. */
    allPolicies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /* Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Indicated whether the report data is loading */
    isLoading: PropTypes.bool,

    /** Forwarded ref to FloatingActionButtonAndPopover */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    allPolicies: {},
    betas: [],
    isLoading: false,
    innerRef: null,
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 * @param {Object} props
 * @returns {JSX.Element}
 */
function FloatingActionButtonAndPopover(props) {
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const isAnonymousUser = Session.isAnonymousUser();

    const prevIsFocused = usePrevious(props.isFocused);

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
            props.onHideCreateMenu();
            setIsCreateMenuActive(false);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCreateMenuActive],
    );

    /**
     * Checks if user is anonymous. If true, shows the sign in modal, else,
     * executes the callback.
     *
     * @param {Function} callback
     */
    const interceptAnonymousUser = (callback) => {
        if (isAnonymousUser) {
            Session.signOutAndRedirectToSignIn();
        } else {
            callback();
        }
    };

    useEffect(
        () => {
            const navigationState = props.navigation.getState();
            const routes = lodashGet(navigationState, 'routes', []);
            const currentRoute = routes[navigationState.index];
            if (currentRoute && ![NAVIGATORS.CENTRAL_PANE_NAVIGATOR, SCREENS.HOME].includes(currentRoute.name)) {
                return;
            }
            Welcome.show({routes, showCreateMenu});
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
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

    const workspaces = PolicyUtils.getActivePolicies(props.allPolicies);

    return (
        <View>
            <PopoverMenu
                onClose={hideCreateMenu}
                isVisible={isCreateMenuActive}
                anchorPosition={styles.createMenuPositionSidebar(props.windowHeight)}
                onItemSelected={hideCreateMenu}
                fromSidebarMediumScreen={!props.isSmallScreenWidth}
                menuItems={[
                    {
                        icon: Expensicons.ChatBubble,
                        text: props.translate('sidebarScreen.newChat'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.NEW_CHAT)),
                    },
                    {
                        icon: Expensicons.Users,
                        text: props.translate('sidebarScreen.newGroup'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.NEW_GROUP)),
                    },
                    ...(Permissions.canUsePolicyRooms(props.betas) && workspaces.length
                        ? [
                              {
                                  icon: Expensicons.Hashtag,
                                  text: props.translate('sidebarScreen.newRoom'),
                                  onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_NEW_ROOM)),
                              },
                          ]
                        : []),
                    ...(Permissions.canUseIOUSend(props.betas)
                        ? [
                              {
                                  icon: Expensicons.Send,
                                  text: props.translate('iou.sendMoney'),
                                  onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.MONEY_REQUEST_TYPE.SEND)),
                              },
                          ]
                        : []),
                    {
                        icon: Expensicons.MoneyCircle,
                        text: props.translate('iou.requestMoney'),
                        onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)),
                    },
                    {
                        icon: Expensicons.Receipt,
                        text: props.translate('iou.splitBill'),
                        onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)),
                    },
                    ...(Permissions.canUseTasks(props.betas)
                        ? [
                              {
                                  icon: Expensicons.Task,
                                  text: props.translate('newTaskPage.assignTask'),
                                  onSelected: () => interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                              },
                          ]
                        : []),
                    ...(!props.isLoading && !Policy.hasActiveFreePolicy(props.allPolicies)
                        ? [
                              {
                                  icon: Expensicons.NewWorkspace,
                                  iconWidth: 46,
                                  iconHeight: 40,
                                  text: props.translate('workspace.new.newWorkspace'),
                                  description: props.translate('workspace.new.getTheExpensifyCardAndMore'),
                                  onSelected: () => interceptAnonymousUser(() => App.createWorkspaceAndNavigateToIt()),
                              },
                          ]
                        : []),
                ]}
            />
            <FloatingActionButton
                accessibilityLabel={props.translate('sidebarScreen.fabNewChat')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                isActive={isCreateMenuActive}
                onPress={showCreateMenu}
            />
        </View>
    );
}

FloatingActionButtonAndPopover.propTypes = propTypes;
FloatingActionButtonAndPopover.defaultProps = defaultProps;
FloatingActionButtonAndPopover.displayName = 'FloatingActionButtonAndPopover';

export default compose(
    withLocalize,
    withNavigation,
    withNavigationFocus,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isLoading: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(
    forwardRef((props, ref) => (
        <FloatingActionButtonAndPopover
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
);
