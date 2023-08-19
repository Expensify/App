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
import * as Report from '../../actions/Report';
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
import DesktopSignInRedirectPage from '../../../pages/signin/DesktopSignInRedirectPage';
import styles from '../../../styles/styles';
import * as SessionUtils from '../../SessionUtils';
import getNavigationModalCardStyle from '../../../styles/getNavigationModalCardStyles';

let timezone;
let currentAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val hasn't accountID
        if (!_.has(val, 'accountID')) {
            timezone = null;
            return;
        }

        currentAccountID = val.accountID;
        if (Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            // This means sign in in RHP was successful, so we can dismiss the modal and subscribe to user events
            Navigation.dismissModal();
            User.subscribeToUserEvents();
        }
    },
});

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        if (!val || timezone) {
            return;
        }

        timezone = lodashGet(val, [currentAccountID, 'timezone'], {});
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

    /** The report ID of the last opened public room as anonymous user */
    lastOpenedPublicRoomID: PropTypes.string,

    /** Opt-in experimental mode that prevents certain Onyx keys from persisting to disk */
    isUsingMemoryOnlyKeys: PropTypes.bool,

    /** The last Onyx update ID was applied to the client */
    lastUpdateIDAppliedToClient: PropTypes.number,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isUsingMemoryOnlyKeys: false,
    session: {
        email: null,
    },
    lastOpenedPublicRoomID: null,
    lastUpdateIDAppliedToClient: null,
};

class AuthScreens extends React.Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(() => App.reconnectApp(this.props.lastUpdateIDAppliedToClient));
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
        }).then(() => {
            User.subscribeToUserEvents();
        });

        // If we are on this screen then we are "logged in", but the user might not have "just logged in". They could be reopening the app
        // or returning from background. If so, we'll assume they have some app data already and we can call reconnectApp() instead of openApp().
        // Note: If a Guide has enabled the memory only key mode then we do want to run OpenApp as their app will not be rehydrated with
        // the correct state on refresh. They are explicitly opting out of storing data they would need (i.e. reports_) to take advantage of
        // the optimizations performed during ReconnectApp.
        const shouldGetAllData = this.props.isUsingMemoryOnlyKeys || SessionUtils.didUserLogInDuringSession();
        if (shouldGetAllData) {
            App.openApp();
        } else {
            App.reconnectApp(this.props.lastUpdateIDAppliedToClient);
        }

        App.setUpPoliciesAndNavigate(this.props.session, !this.props.isSmallScreenWidth);
        App.redirectThirdPartyDesktopSignIn();

        if (this.props.lastOpenedPublicRoomID) {
            // Re-open the last opened public room if the user logged in from a public room link
            Report.openLastOpenedPublicRoom(this.props.lastOpenedPublicRoomID);
        }
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
            cardStyle: getNavigationModalCardStyle({
                isSmallScreenWidth: this.props.isSmallScreenWidth,
            }),
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
                    name={SCREENS.TRANSITION_BETWEEN_APPS}
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
                    name={SCREENS.REPORT_ATTACHMENTS}
                    options={{
                        headerShown: false,
                        presentation: 'transparentModal',
                    }}
                    getComponent={() => {
                        const ReportAttachments = require('../../../pages/home/report/ReportAttachments').default;
                        return ReportAttachments;
                    }}
                    listeners={modalScreenListeners}
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
                <RootStack.Screen
                    name="DesktopSignInRedirect"
                    options={defaultScreenOptions}
                    component={DesktopSignInRedirectPage}
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
        lastOpenedPublicRoomID: {
            key: ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID,
        },
        isUsingMemoryOnlyKeys: {
            key: ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS,
        },
        lastUpdateIDAppliedToClient: {
            key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
        },
    }),
)(AuthScreens);
