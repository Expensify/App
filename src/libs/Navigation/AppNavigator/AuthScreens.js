import React from 'react';
import PropTypes from 'prop-types';
import {Linking} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {getNavigationModalCardStyle} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../compose';
import {
    subscribeToUserEvents,
    fetchAllReports,
} from '../../actions/Report';
import * as PersonalDetails from '../../actions/PersonalDetails';
import * as Pusher from '../../Pusher/pusher';
import PusherConnectionManager from '../../PusherConnectionManager';
import UnreadIndicatorUpdater from '../../UnreadIndicatorUpdater';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import Timing from '../../actions/Timing';
import NetworkConnection from '../../NetworkConnection';
import CONFIG from '../../../CONFIG';
import {fetchCountryCodeByRequestIP} from '../../actions/GeoLocation';
import KeyboardShortcut from '../../KeyboardShortcut';
import Navigation from '../Navigation';
import * as User from '../../actions/User';
import {setModalVisibility} from '../../actions/Modal';
import NameValuePair from '../../actions/NameValuePair';
import {getPolicyList} from '../../actions/Policy';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';
import getOperatingSystem from '../../getOperatingSystem';
import {fetchFreePlanVerifiedBankAccount, fetchUserWallet} from '../../actions/BankAccounts';

// Main drawer navigator
import MainDrawerNavigator from './MainDrawerNavigator';

// Modal Stack Navigators
import {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    IOUSendModalStackNavigator,
    IOUDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    WorkspaceInviteModalStackNavigator,
    RequestCallModalStackNavigator,
    ReportDetailsModalStackNavigator,
} from './ModalStackNavigators';
import SCREENS from '../../../SCREENS';
import Timers from '../../Timers';
import LogInWithShortLivedTokenPage from '../../../pages/LogInWithShortLivedTokenPage';
import defaultScreenOptions from './defaultScreenOptions';
import * as API from '../../API';
import {setLocale} from '../../actions/App';
import {cleanupSession} from '../../actions/Session';

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

let currentPreferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => currentPreferredLocale = val || CONST.DEFAULT_LOCALE,
});

const RootStack = createCustomModalStackNavigator();

// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/
const modalScreenListeners = {
    focus: () => {
        setModalVisibility(true);
    },
    beforeRemove: () => {
        setModalVisibility(false);
    },
};

const propTypes = {
    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    network: {isOffline: true},
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
            subscribeToUserEvents();
            User.subscribeToUserEvents();
        });

        // Fetch some data we need on initialization
        NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.NVP_PRIORITY_MODE, 'default');
        NameValuePair.get(CONST.NVP.IS_FIRST_TIME_NEW_EXPENSIFY_USER, ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER, true);

        API.Get({
            returnValueList: 'nameValuePairs',
            nvpNames: ONYXKEYS.NVP_PREFERRED_LOCALE,
        }).then((response) => {
            const preferredLocale = lodashGet(response, ['nameValuePairs', 'preferredLocale'], CONST.DEFAULT_LOCALE);
            if ((currentPreferredLocale !== CONST.DEFAULT_LOCALE) && (preferredLocale !== currentPreferredLocale)) {
                setLocale(currentPreferredLocale);
            } else {
                Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, preferredLocale);
            }
        });

        PersonalDetails.fetchPersonalDetails();
        User.getUserDetails();
        User.getBetas();
        User.getDomainInfo();
        PersonalDetails.fetchLocalCurrency();
        fetchAllReports(true, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();
        fetchFreePlanVerifiedBankAccount();
        fetchUserWallet();

        // Load policies, maybe creating a new policy first.
        Linking.getInitialURL()
            .then((url) => {
                // url is null on mobile unless the app was opened via a deeplink
                if (url) {
                    const path = new URL(url).pathname;
                    const exitTo = new URLSearchParams(url).get('exitTo');
                    const shouldCreateFreePolicy = Str.startsWith(path, Str.normalizeUrl(ROUTES.LOGIN_WITH_SHORT_LIVED_TOKEN)) && exitTo === ROUTES.WORKSPACE_NEW;
                    getPolicyList(shouldCreateFreePolicy);
                } else {
                    getPolicyList(false);
                }
            });

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

        let searchShortcutModifiers = ['control'];
        let groupShortcutModifiers = ['control', 'shift'];

        if (getOperatingSystem() === CONST.OS.MAC_OS) {
            searchShortcutModifiers = ['meta'];
            groupShortcutModifiers = ['meta', 'shift'];
        }

        // Listen for the key K being pressed so that focus can be given to
        // the chat switcher, or new group chat
        // based on the key modifiers pressed and the operating system
        this.unsubscribeSearchShortcut = KeyboardShortcut.subscribe('K', () => {
            Navigation.navigate(ROUTES.SEARCH);
        }, searchShortcutModifiers, true);
        this.unsubscribeGroupShortcut = KeyboardShortcut.subscribe('K', () => {
            Navigation.navigate(ROUTES.NEW_GROUP);
        }, groupShortcutModifiers, true);
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
        cleanupSession();
        clearInterval(this.interval);
        this.interval = null;
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
            cardStyle: getNavigationModalCardStyle(this.props.isSmallScreenWidth),
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
                    component={SettingsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="NewChat"
                    options={modalScreenOptions}
                    component={NewChatModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="NewGroup"
                    options={modalScreenOptions}
                    component={NewGroupModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Search"
                    options={modalScreenOptions}
                    component={SearchModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Details"
                    options={modalScreenOptions}
                    component={DetailsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Report_Details"
                    options={modalScreenOptions}
                    component={ReportDetailsModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="Participants"
                    options={modalScreenOptions}
                    component={ReportParticipantsModalStackNavigator}
                />
                <RootStack.Screen
                    name="IOU_Request"
                    options={modalScreenOptions}
                    component={IOURequestModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Bill"
                    options={modalScreenOptions}
                    component={IOUBillStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="EnablePayments"
                    options={modalScreenOptions}
                    component={EnablePaymentsStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Details"
                    options={modalScreenOptions}
                    component={IOUDetailsModalStackNavigator}
                />
                <RootStack.Screen
                    name="AddPersonalBankAccount"
                    options={modalScreenOptions}
                    component={AddPersonalBankAccountModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="WorkspaceInvite"
                    options={modalScreenOptions}
                    component={WorkspaceInviteModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="RequestCall"
                    options={modalScreenOptions}
                    component={RequestCallModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="IOU_Send"
                    options={modalScreenOptions}
                    component={IOUSendModalStackNavigator}
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
        network: {
            key: ONYXKEYS.NETWORK,
        },
    }),
)(AuthScreens);
