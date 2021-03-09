import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {Route} from '../../libs/Router';
import styles from '../../styles/styles';
import SidebarScreen from './sidebar/SidebarScreen';
import ReportScreen from './ReportScreen';
import NewGroupPage from '../NewGroupPage';
import NewChatPage from '../NewChatPage';
import SettingsPage from '../SettingsPage';
import SearchPage from '../SearchPage';
import ProfilePage from '../ProfilePage';

import {
    subscribeToReportCommentEvents,
    fetchAll as fetchAllReports,
} from '../../libs/actions/Report';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import * as Pusher from '../../libs/Pusher/pusher';
import PusherConnectionManager from '../../libs/PusherConnectionManager';
import UnreadIndicatorUpdater from '../../libs/UnreadIndicatorUpdater';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import Timing from '../../libs/actions/Timing';
import NetworkConnection from '../../libs/NetworkConnection';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import {fetchCountryCodeByRequestIP} from '../../libs/actions/GeoLocation';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import {redirect} from '../../libs/actions/App';
import RightDockedModal from '../../components/RightDockedModal';
import IOUModal from '../iou/IOUModal';
import {getBetas} from '../../libs/actions/User';
import NameValuePair from '../../libs/actions/NameValuePair';

const propTypes = {
    network: PropTypes.shape({isOffline: PropTypes.bool}),
};

const defaultProps = {
    network: {isOffline: true},
};

class HomePage extends PureComponent {
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
        }).then(subscribeToReportCommentEvents);

        // Fetch some data we need on initialization
        NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.PRIORITY_MODE, 'default');
        PersonalDetails.fetch();
        PersonalDetails.fetchTimezone();
        getBetas();
        fetchAllReports(true, false, true);
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
            PersonalDetails.fetchTimezone();
            getBetas();
        }, 1000 * 60 * 30);

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            redirect(ROUTES.SEARCH);
        }, ['meta'], true);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
        NetworkConnection.stopListeningForReconnect();
        clearInterval(this.interval);
        this.interval = null;
    }

    render() {
        return (
            <View style={[styles.flexRow, styles.h100, styles.appContentWrapper]}>
                <Route path={[
                    ROUTES.REPORT,
                    ROUTES.HOME,
                    ROUTES.SETTINGS,
                    ROUTES.NEW_GROUP,
                    ROUTES.NEW_CHAT,
                    ROUTES.SEARCH,
                    ROUTES.IOU_REQUEST,
                    ROUTES.IOU_BILL,
                    ROUTES.PROFILE,
                ]}
                >
                    {/* Sidebar Screen */}
                    <SidebarScreen />

                    {/* Report Screen */}
                    <ReportScreen />

                    {/* Modal Screens */}
                    <RightDockedModal routes={[ROUTES.SETTINGS]}>
                        <SettingsPage />
                    </RightDockedModal>
                    <RightDockedModal routes={[ROUTES.NEW_GROUP]}>
                        <NewGroupPage />
                    </RightDockedModal>
                    <RightDockedModal routes={[ROUTES.NEW_CHAT]}>
                        <NewChatPage />
                    </RightDockedModal>
                    <RightDockedModal routes={[ROUTES.SEARCH]}>
                        <SearchPage />
                    </RightDockedModal>
                    <RightDockedModal routes={[ROUTES.IOU_REQUEST, ROUTES.IOU_BILL]}>
                        <IOUModal />
                    </RightDockedModal>
                    <RightDockedModal route="/profile/">
                        <ProfilePage />
                    </RightDockedModal>
                </Route>
            </View>
        );
    }
}

HomePage.propTypes = propTypes;
HomePage.defaultProps = defaultProps;

export default withOnyx({
    network: {
        key: ONYXKEYS.NETWORK,
    },
})(HomePage);
