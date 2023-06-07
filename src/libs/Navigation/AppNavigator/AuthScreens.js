import React from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../compose';
import * as PersonalDetails from '../../actions/PersonalDetails';
import * as Pusher from '../../Pusher/pusher';
import PusherConnectionManager from '../../PusherConnectionManager';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import Timing from '../../actions/Timing';
import NetworkConnection from '../../NetworkConnection';
import CONFIG from '../../../CONFIG';
import KeyboardShortcut from '../../KeyboardShortcut';
import Navigation from '../Navigation';
import * as User from '../../actions/User';
import * as Modal from '../../actions/Modal';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import createResponsiveStackNavigator from './createResponsiveStackNavigator';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import * as App from '../../actions/App';
import * as Download from '../../actions/Download';
import * as Session from '../../actions/Session';
import RightModalNavigator from './Navigators/RightModalNavigator';
import CentralPaneNavigator from './Navigators/CentralPaneNavigator';
import NAVIGATORS from '../../../NAVIGATORS';
import FullScreenNavigator from './Navigators/FullScreenNavigator';
import styles from '../../../styles/styles';

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserEmail = val.email;
    },
});

let timezone;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => {
        if (!val || timezone) {
            return;
        }

        timezone = lodashGet(val, [currentUserEmail, 'timezone'], {});
        const currentTimezone = moment.tz.guess(true);

        // If the current timezone is different than the user's timezone, and their timezone is set to automatic
        // then update their timezone.
        if (_.isObject(timezone) && timezone.automatic && timezone.selected !== currentTimezone) {
            timezone.selected = currentTimezone;
            PersonalDetails.updateAutomaticTimezone(timezone);
        }
    },
});

const RootStack = createResponsiveStackNavigator();

// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/
const modalScreenListeners = {
    focus: () => {
        Modal.setModalVisibility(true);
    },
    beforeRemove: () => {
        Modal.setModalVisibility(false);
    },
};

const propTypes = {
    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
};

class AuthScreens extends React.Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(() => App.reconnectApp());
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
        }).then(() => {
            User.subscribeToUserEvents();
        });

        App.openApp();
        App.setUpPoliciesAndNavigate(this.props.session);
        Download.clearDownloads();
        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        const searchShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const groupShortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_GROUP;

        // Listen for the key K being pressed so that focus can be given to
        // the chat switcher, or new group chat
        // based on the key modifiers pressed and the operating system
        this.unsubscribeSearchShortcut = KeyboardShortcut.subscribe(
            searchShortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isActiveRoute(ROUTES.SEARCH)) {
                        return;
                    }
                    return Navigation.navigate(ROUTES.SEARCH);
                });
            },
            searchShortcutConfig.descriptionKey,
            searchShortcutConfig.modifiers,
            true,
        );
        this.unsubscribeGroupShortcut = KeyboardShortcut.subscribe(
            groupShortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isActiveRoute(ROUTES.NEW_GROUP)) {
                        return;
                    }
                    Navigation.navigate(ROUTES.NEW_GROUP);
                });
            },
            groupShortcutConfig.descriptionKey,
            groupShortcutConfig.modifiers,
            true,
        );
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.windowHeight !== this.props.windowHeight || nextProps.isSmallScreenWidth !== this.props.isSmallScreenWidth;
    }

    componentWillUnmount() {
        if (this.unsubscribeSearchShortcut) {
            this.unsubscribeSearchShortcut();
        }
        if (this.unsubscribeGroupShortcut) {
            this.unsubscribeGroupShortcut();
        }
        Session.cleanupSession();
        clearInterval(this.interval);
        this.interval = null;
    }

    render() {
        const commonScreenOptions = {
            headerShown: false,
            gestureDirection: 'horizontal',
            animationEnabled: true,
            cardStyleInterpolator: (props) => modalCardStyleInterpolator(this.props.isSmallScreenWidth, false, props),
            cardOverlayEnabled: true,
            animationTypeForReplace: 'push',
        };

        const rightModalNavigatorScreenOptions = {
            ...commonScreenOptions,
            // we want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            cardStyle: styles.navigationModalCard(this.props.isSmallScreenWidth),
        };

        return (
            <RootStack.Navigator
                isSmallScreenWidth={this.props.isSmallScreenWidth}
                mode="modal"
                // We are disabling the default keyboard handling here since the automatic behavior is to close a
                // keyboard that's open when swiping to dismiss a modal. In those cases, pressing the back button on
                // a header will briefly open and close the keyboard and crash Android.
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                keyboardHandlingEnabled={false}
            >
                <RootStack.Screen
                    name={SCREENS.HOME}
                    options={{
                        ...commonScreenOptions,
                        title: 'New Expensify',

                        // Prevent unnecessary scrolling
                        cardStyle: styles.cardStyleNavigator,
                    }}
                    getComponent={() => {
                        const SidebarScreen = require('../../../pages/home/sidebar/SidebarScreen').default;
                        return SidebarScreen;
                    }}
                />
                <RootStack.Screen
                    name={NAVIGATORS.CENTRAL_PANE_NAVIGATOR}
                    options={{
                        ...commonScreenOptions,
                        title: 'New Expensify',

                        // Prevent unnecessary scrolling
                        cardStyle: styles.cardStyleNavigator,
                        cardStyleInterpolator: (props) => modalCardStyleInterpolator(this.props.isSmallScreenWidth, false, props),
                    }}
                    component={CentralPaneNavigator}
                />
                <RootStack.Screen
                    name="ValidateLogin"
                    options={{
                        headerShown: false,
                        title: 'New Expensify',
                    }}
                    getComponent={() => {
                        const ValidateLoginPage = require('../../../pages/ValidateLoginPage').default;
                        return ValidateLoginPage;
                    }}
                />
                <RootStack.Screen
                    name={SCREENS.TRANSITION_FROM_OLD_DOT}
                    options={defaultScreenOptions}
                    getComponent={() => {
                        const LogOutPreviousUserPage = require('../../../pages/LogOutPreviousUserPage').default;
                        return LogOutPreviousUserPage;
                    }}
                />
                <RootStack.Screen
                    name="Concierge"
                    options={defaultScreenOptions}
                    getComponent={() => {
                        const ConciergePage = require('../../../pages/ConciergePage').default;
                        return ConciergePage;
                    }}
                />
                <RootStack.Screen
                    name={NAVIGATORS.FULL_SCREEN_NAVIGATOR}
                    options={defaultScreenOptions}
                    component={FullScreenNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                    options={rightModalNavigatorScreenOptions}
                    component={RightModalNavigator}
                    listeners={modalScreenListeners}
                />
            </RootStack.Navigator>
        );
    }
}

AuthScreens.propTypes = propTypes;
AuthScreens.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(AuthScreens);
