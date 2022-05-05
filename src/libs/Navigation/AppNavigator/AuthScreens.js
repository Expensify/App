import React from 'react';
import {Linking} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as StyleUtils from '../../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../compose';
import * as Report from '../../actions/Report';
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
import * as Policy from '../../actions/Policy';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';

// Main drawer navigator
import MainDrawerNavigator from './MainDrawerNavigator';

// Modal Stack Navigators
import * as ModalStackNavigators from './ModalStackNavigators';
import SCREENS from '../../../SCREENS';
import Timers from '../../Timers';
import LogInWithShortLivedTokenPage from '../../../pages/LogInWithShortLivedTokenPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import defaultScreenOptions from './defaultScreenOptions';
import * as Session from '../../actions/Session';
import networkPropTypes from '../../../components/networkPropTypes';
import {withNetwork} from '../../../components/OnyxProvider';

Onyx.connect({
    key: ONYXKEYS.MY_PERSONAL_DETAILS,
    callback: (val) => {
        if (!val) {
            return;
        }

        const timezone = lodashGet(val, 'timezone', {});
        const currentTimezone = moment.tz.guess(true);

        // If the current timezone is different than the user's timezone, and their timezone is set to automatic
        // then update their timezone.
        if (_.isObject(timezone) && timezone.automatic && timezone.selected !== currentTimezone) {
            timezone.selected = currentTimezone;
            PersonalDetails.setPersonalDetails({timezone});
        }
    },
});

const RootStack = createCustomModalStackNavigator();

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
    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,
};

class AuthScreens extends React.Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        Timing.start(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        }).then(() => {
            Report.subscribeToUserEvents();
            User.subscribeToUserEvents();
            Policy.subscribeToPolicyEvents();
        });

        // Fetch some data we need on initialization
        Session.loadInitialData();

        // Load policies, maybe creating a new policy first.
        Linking.getInitialURL()
            .then((url) => {
                if (this.shouldCreateFreePolicy(url)) {
                    Policy.createAndGetPolicyList();
                    return;
                }

                Policy.getPolicyList();
            });

        Session.fixAccountAndReloadData();

        // Refresh the personal details, timezone and betas every 30 minutes
        // There is no pusher event that sends updated personal details data yet
        // See https://github.com/Expensify/ReactNativeChat/issues/468
        this.interval = Timers.register(setInterval(() => {
            if (this.props.network.isOffline) {
                return;
            }
            PersonalDetails.fetchPersonalDetails();
            User.getUserDetails();
            User.getBetas();
        }, 1000 * 60 * 30));

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        const searchShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const groupShortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_GROUP;

        // Listen for the key K being pressed so that focus can be given to
        // the chat switcher, or new group chat
        // based on the key modifiers pressed and the operating system
        this.unsubscribeSearchShortcut = KeyboardShortcut.subscribe(searchShortcutConfig.shortcutKey, () => {
            Navigation.navigate(ROUTES.SEARCH);
        }, searchShortcutConfig.descriptionKey, searchShortcutConfig.modifiers, true);
        this.unsubscribeGroupShortcut = KeyboardShortcut.subscribe(groupShortcutConfig.shortcutKey, () => {
            Navigation.navigate(ROUTES.NEW_GROUP);
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

    /**
     * @param {String} [url]
     * @returns {Boolean}
     */
    shouldCreateFreePolicy(url = '') {
        if (!url) {
            return false;
        }

        const path = new URL(url).pathname;
        const params = new URLSearchParams(url);
        const exitTo = params.get('exitTo');
        const email = params.get('email');
        const isLoggingInAsNewUser = !_.isNull(this.props.session.email) && (email !== this.props.session.email);
        return !isLoggingInAsNewUser
            && Str.startsWith(path, Str.normalizeUrl(ROUTES.LOGIN_WITH_SHORT_LIVED_TOKEN))
            && exitTo === ROUTES.WORKSPACE_NEW;
    }

    render() {
        const commonModalScreenOptions = {
            headerShown: false,
            gestureDirection: 'horizontal',
            animationEnabled: true,

            // This option is required to make previous screen visible underneath the modal screen
            // https://reactnavigation.org/docs/6.x/stack-navigator#transparent-modals
            presentation: 'transparentModal',
        };
        const modalScreenOptions = {
            ...commonModalScreenOptions,
            cardStyle: StyleUtils.getNavigationModalCardStyle(this.props.isSmallScreenWidth),
            cardStyleInterpolator: props => modalCardStyleInterpolator(this.props.isSmallScreenWidth, false, props),
            cardOverlayEnabled: true,

            // This is a custom prop we are passing to custom navigator so that we will know to add a Pressable overlay
            // when displaying a modal. This allows us to dismiss by clicking outside on web / large screens.
            isModal: true,
        };

        return (
            <RootStack.Navigator
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
                    component={MainDrawerNavigator}
                />
                <RootStack.Screen
                    name="ValidateLogin"
                    options={{
                        headerShown: false,
                        title: 'New Expensify',
                    }}
                    component={ValidateLoginPage}
                />
                <RootStack.Screen
                    name={SCREENS.LOG_IN_WITH_SHORT_LIVED_TOKEN}
                    options={defaultScreenOptions}
                    component={LogInWithShortLivedTokenPage}
                />

                {/* These are the various modal routes */}
                {/* Note: Each modal must have it's own stack navigator since we want to be able to navigate to any
                modal subscreens e.g. `/settings/profile` and this will allow us to navigate while inside the modal. We
                are also using a custom navigator on web so even if a modal does not have any subscreens it still must
                use a navigator */}
                <RootStack.Screen
                    name="Settings"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.SettingsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="NewChat"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.NewChatModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="NewGroup"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.NewGroupModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Search"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.SearchModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Details"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.DetailsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Report_Details"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.ReportDetailsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Report_Settings"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.ReportSettingsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Participants"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
                />
                <RootStack.Screen
                    name="IOU_Request"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.IOURequestModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Bill"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.IOUBillStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="EnablePayments"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.EnablePaymentsStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Details"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.IOUDetailsModalStackNavigator}
                />
                <RootStack.Screen
                    name="AddPersonalBankAccount"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="RequestCall"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.RequestCallModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Send"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.IOUSendModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Wallet_Statement"
                    options={modalScreenOptions}
                    component={ModalStackNavigators.WalletStatementStackNavigator}
                    listeners={modalScreenListeners}
                />
            </RootStack.Navigator>
        );
    }
}

AuthScreens.propTypes = propTypes;
export default compose(
    withWindowDimensions,
    withNetwork(),
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(AuthScreens);
