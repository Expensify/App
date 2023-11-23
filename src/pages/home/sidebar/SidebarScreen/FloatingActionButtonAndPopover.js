import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FloatingActionButton from '@components/FloatingActionButton';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withNavigation from '@components/withNavigation';
import withNavigationFocus from '@components/withNavigationFocus';
import withWindowDimensions from '@components/withWindowDimensions';
import usePrevious from '@hooks/usePrevious';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as App from '@userActions/App';
import * as IOU from '@userActions/IOU';
import * as Policy from '@userActions/Policy';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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

    /** Indicated whether the report data is loading */
    isLoading: PropTypes.bool,

    /** Forwarded ref to FloatingActionButtonAndPopover */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    /** Information about any currently running demos */
    demoInfo: PropTypes.shape({
        money2020: PropTypes.shape({
            isBeginningDemo: PropTypes.bool,
        }),
    }),
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    allPolicies: {},
    isLoading: false,
    innerRef: null,
    demoInfo: {},
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 * @param {Object} props
 * @returns {JSX.Element}
 */
function FloatingActionButtonAndPopover(props) {
    const styles = useThemeStyles();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const isAnonymousUser = Session.isAnonymousUser();
    const anchorRef = useRef(null);

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

    useEffect(() => {
        const navigationState = props.navigation.getState();
        const routes = lodashGet(navigationState, 'routes', []);
        const currentRoute = routes[navigationState.index];
        if (currentRoute && ![NAVIGATORS.CENTRAL_PANE_NAVIGATOR, SCREENS.HOME].includes(currentRoute.name)) {
            return;
        }
        if (lodashGet(props.demoInfo, 'money2020.isBeginningDemo', false)) {
            return;
        }
        Welcome.show({routes, showCreateMenu});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isLoading]);

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
                        text: props.translate('sidebarScreen.fabNewChat'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.NEW)),
                    },
                    {
                        icon: Expensicons.MoneyCircle,
                        text: props.translate('iou.requestMoney'),
                        onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.TYPE.REQUEST)),
                    },
                    {
                        icon: Expensicons.Send,
                        text: props.translate('iou.sendMoney'),
                        onSelected: () => interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.TYPE.SEND)),
                    },
                    ...[
                        {
                            icon: Expensicons.Task,
                            text: props.translate('newTaskPage.assignTask'),
                            onSelected: () => interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                        },
                    ],
                    {
                        icon: Expensicons.Heart,
                        text: props.translate('sidebarScreen.saveTheWorld'),
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.TEACHERS_UNITE)),
                    },
                    ...(!props.isLoading && !Policy.hasActiveFreePolicy(props.allPolicies)
                        ? [
                              {
                                  icon: Expensicons.NewWorkspace,
                                  iconWidth: 46,
                                  iconHeight: 40,
                                  text: props.translate('workspace.new.newWorkspace'),
                                  description: props.translate('workspace.new.getTheExpensifyCardAndMore'),
                                  onSelected: () => interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()),
                              },
                          ]
                        : []),
                ]}
                withoutOverlay
                anchorRef={anchorRef}
            />
            <FloatingActionButton
                accessibilityLabel={props.translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={anchorRef}
                onPress={() => {
                    if (isCreateMenuActive) {
                        hideCreateMenu();
                    } else {
                        showCreateMenu();
                    }
                }}
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
    withLocalize,
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
        demoInfo: {
            key: ONYXKEYS.DEMO_INFO,
        },
    }),
)(FloatingActionButtonAndPopoverWithRef);
