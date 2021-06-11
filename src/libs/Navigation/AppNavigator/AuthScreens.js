import React from 'react';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
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
import {getPolicySummaries, getPolicyList} from '../../actions/Policy';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';

// Main drawer navigator
import MainDrawerNavigator from './MainDrawerNavigator';

// Validate login page
import ValidateLoginPage from '../../../pages/ValidateLoginPage';

// Modal Stack Navigators
import {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    IOUDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    BusinessBankAccountModalStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    WorkspaceInviteModalStackNavigator,
} from './ModalStackNavigators';
import SCREENS from '../../../SCREENS';
import Timers from '../../Timers';

Onyx.connect({
    key: ONYXKEYS.MY_PERSONAL_DETAILS,
    callback: (val) => {
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
// that depends on modal visibility until Modal is completely closed or its transition has ended
// When modal screen is focused and animation transition is ended, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/
const modalScreenListeners = {
    transitionEnd: () => {
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
        }).then(subscribeToUserEvents);

        // Fetch some data we need on initialization
        NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.NVP_PRIORITY_MODE, 'default');
        PersonalDetails.fetchPersonalDetails();
        User.getUserDetails();
        User.getBetas();
        PersonalDetails.fetchCurrencyPreferences();
        fetchAllReports(true, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();
        getPolicySummaries();
        getPolicyList();

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

        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            Navigation.navigate(ROUTES.SEARCH);
        }, ['meta'], true);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.isSmallScreenWidth !== this.props.isSmallScreenWidth) {
            return true;
        }

        return false;
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
        NetworkConnection.stopListeningForReconnect();
        clearInterval(this.interval);
        this.interval = null;
    }

    render() {
        const modalScreenOptions = {
            headerShown: false,
            cardStyle: getNavigationModalCardStyle(this.props.isSmallScreenWidth),
            cardStyleInterpolator: props => modalCardStyleInterpolator(this.props.isSmallScreenWidth, props),
            animationEnabled: true,
            gestureDirection: 'horizontal',
            cardOverlayEnabled: true,

            // This option is required to make previous screen visible underneath the modal screen
            // https://reactnavigation.org/docs/6.x/stack-navigator#transparent-modals
            presentation: 'transparentModal',

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
                        title: 'Expensify.cash',
                    }}
                    component={MainDrawerNavigator}
                />
                <RootStack.Screen
                    name="ValidateLogin"
                    options={{
                        headerShown: false,
                        title: 'Expensify.cash',
                    }}
                    component={ValidateLoginPage}
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
                    name="BusinessBankAccount"
                    options={modalScreenOptions}
                    component={BusinessBankAccountModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name="WorkspaceInvite"
                    options={modalScreenOptions}
                    component={WorkspaceInviteModalStackNavigator}
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
