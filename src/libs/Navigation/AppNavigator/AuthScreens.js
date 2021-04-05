import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {getNavigationModalCardStyle} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../compose';
import {
    subscribeToReportCommentAndTogglePinnedEvents,
    fetchAll as fetchAllReports,
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
import NameValuePair from '../../actions/NameValuePair';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';

// Main drawer navigator
import MainDrawerNavigator from './MainDrawerNavigator';

// Modal Stack Navigators
import {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    DetailsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
} from './ModalStackNavigators';

const RootStack = createCustomModalStackNavigator();

const propTypes = {
    network: PropTypes.shape({isOffline: PropTypes.bool}),
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
        }).then(subscribeToReportCommentAndTogglePinnedEvents);

        // Fetch some data we need on initialization
        NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.NVP_PRIORITY_MODE, 'default');
        PersonalDetails.fetch();
        User.fetch();
        User.getBetas();
        fetchAllReports(true, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();

        // Refresh the personal details, timezone and betas every 30 minutes
        // There is no pusher event that sends updated personal details data yet
        // See https://github.com/Expensify/ReactNativeChat/issues/468
        this.interval = setInterval(() => {
            if (this.props.network.isOffline) {
                return;
            }
            PersonalDetails.fetch();
            User.fetch();
            User.getBetas();
        }, 1000 * 60 * 30);

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            Navigation.navigate(ROUTES.SEARCH);
        }, ['meta'], true);
    }

    shouldComponentUpdate(prevProps) {
        if (prevProps.isSmallScreenWidth !== this.props.isSmallScreenWidth) {
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
            cardStyleInterpolator: modalCardStyleInterpolator,
            animationEnabled: true,
            gestureDirection: 'horizontal',

            // This is a custom prop we are passing to custom navigator so that we will know to add a Pressable overlay
            // when displaying a modal. This allows us to dismiss by clicking outside on web / large screens.
            isModal: true,
        };
        return (
            <RootStack.Navigator
                mode="modal"
            >
                {/* The MainDrawerNavigator contains the SidebarScreen and ReportScreen */}
                <RootStack.Screen
                    name="Home"
                    options={{
                        headerShown: false,
                        title: 'Expensify.cash',
                    }}
                    component={MainDrawerNavigator}
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
                />
                <RootStack.Screen
                    name="NewChat"
                    options={modalScreenOptions}
                    component={NewChatModalStackNavigator}
                />
                <RootStack.Screen
                    name="NewGroup"
                    options={modalScreenOptions}
                    component={NewGroupModalStackNavigator}
                />
                <RootStack.Screen
                    name="Search"
                    options={modalScreenOptions}
                    component={SearchModalStackNavigator}
                />
                <RootStack.Screen
                    name="Details"
                    options={modalScreenOptions}
                    component={DetailsModalStackNavigator}
                />
                <RootStack.Screen
                    name="IOU_Request"
                    options={modalScreenOptions}
                    component={IOURequestModalStackNavigator}
                />
                <RootStack.Screen
                    name="IOU_Bill"
                    options={modalScreenOptions}
                    component={IOUBillStackNavigator}
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
