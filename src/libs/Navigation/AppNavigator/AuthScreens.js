import React from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import getNavigationModalCardStyle from '../../../styles/getNavigationModalCardStyles';
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
import createResponsiveStackNavigator from './ResponsiveStackNavigator/createResponsiveStackNavigator';
import NotFoundPage from '../../../pages/ErrorPage/NotFoundPage';
import getCurrentUrl from '../currentUrl';

// Modal Stack Navigators
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import * as App from '../../actions/App';
import * as Download from '../../actions/Download';
import * as Session from '../../actions/Session';
import RightModalStack from './RightModalStack';

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
        this.unsubscribeSearchShortcut = KeyboardShortcut.subscribe(searchShortcutConfig.shortcutKey, () => {
            Modal.close(() => Navigation.navigate(ROUTES.SEARCH));
        }, searchShortcutConfig.descriptionKey, searchShortcutConfig.modifiers, true);
        this.unsubscribeGroupShortcut = KeyboardShortcut.subscribe(groupShortcutConfig.shortcutKey, () => {
            Modal.close(() => Navigation.navigate(ROUTES.NEW_GROUP));
        }, groupShortcutConfig.descriptionKey, groupShortcutConfig.modifiers, true);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.isSmallScreenWidth !== this.props.isSmallScreenWidth;
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
        const RightModalStackScreenOptions = {
            headerShown: false,
            gestureDirection: 'horizontal',
            animationEnabled: true,

            cardStyle: getNavigationModalCardStyle(this.props.isSmallScreenWidth),
            cardStyleInterpolator: props => modalCardStyleInterpolator(this.props.isSmallScreenWidth, false, props),
            cardOverlayEnabled: true,

            // This option is required to make previous screen visible underneath the modal screen
            // https://reactnavigation.org/docs/6.x/stack-navigator#transparent-modals
            presentation: 'transparentModal',

            // This is a custom prop we are passing to custom navigator so that we will know to add a Pressable overlay
            // when displaying a modal. This allows us to dismiss by clicking outside on web / large screens.
            isModal: true,
        };
        const url = getCurrentUrl();
        const openOnAdminRoom = url ? new URL(url).searchParams.get('openOnAdminRoom') : '';

        return (
            <RootStack.Navigator
                isNarrowLayout={this.props.isSmallScreenWidth}
                mode="modal"

                // We are disabling the default keyboard handling here since the automatic behavior is to close a
                // keyboard that's open when swiping to dismiss a modal. In those cases, pressing the back button on
                // a header will briefly open and close the keyboard and crash Android.
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                keyboardHandlingEnabled={false}
            >
                {/* The MainDrawerNavigator contains the SidebarScreen and ReportScreen */}
                <RootStack.Screen
                    name={SCREENS.HOME}
                    options={{
                        headerShown: false,
                        title: 'New Expensify',

                        // prevent unnecessary scrolling
                        cardStyle: {
                            overflow: 'hidden',
                            height: '100%',
                        },
                    }}
                    getComponent={() => {
                        const SidebarScreen = require('../../../pages/home/sidebar/SidebarScreen').default;
                        return SidebarScreen;
                    }}
                    initialParams={{openOnAdminRoom: openOnAdminRoom === 'true'}}
                />
                <RootStack.Screen
                    name={SCREENS.REPORT}
                    options={{
                        headerShown: false,
                        title: 'New Expensify',

                        // prevent unnecessary scrolling
                        cardStyle: {
                            overflow: 'hidden',
                            height: '100%',
                        },
                    }}
                    getComponent={() => {
                        const ReportScreen = require('../../../pages/home/ReportScreen').default;
                        return ReportScreen;
                    }}
                    initialParams={{openOnAdminRoom: openOnAdminRoom === 'true'}}
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

                {/* Note: Each modal must have it's own stack navigator since we want to be able to navigate to any
                modal subscreens e.g. `/settings/profile` and this will allow us to navigate while inside the modal. We
                are also using a custom navigator on web so even if a modal does not have any subscreens it still must
                use a navigator */}
                <RootStack.Screen
                    name="RightModalStack"
                    options={RightModalStackScreenOptions}
                    component={RightModalStack}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Select_Year"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.YearPickerStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.NOT_FOUND}
                    options={{headerShown: false}}
                    component={NotFoundPage}
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
