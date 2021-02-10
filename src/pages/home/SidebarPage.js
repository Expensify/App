import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Sidebar from './sidebar/SidebarView';
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
import * as ChatSwitcher from '../../libs/actions/ChatSwitcher';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import {getBetas} from '../../libs/actions/User';
import Navigator from '../../Navigator';
import SafeAreaViewWrapper from '../../components/SafeAreaViewWrapper';
import styles from '../../styles/styles';

const propTypes = {
    network: PropTypes.shape({isOffline: PropTypes.bool}),
    ...windowDimensionsPropTypes,
};
const defaultProps = {
    network: {isOffline: true},
};

class SidebarPage extends React.Component {
    constructor(props) {
        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        Timing.start(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);

        super(props);

        this.state = {
            isCreateMenuActive: false,
        };

        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.timeNavigation = this.timeNavigation.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);
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
            Navigator.navigate(ROUTES.ROOT);
            ChatSwitcher.show();
        }, ['meta'], true);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
        NetworkConnection.stopListeningForReconnect();
        clearInterval(this.interval);
        this.interval = null;
    }

    /**
     * Method called when a Create Menu item is selected.
     */
    onCreateMenuItemSelected() {
        this.toggleCreateMenu();
        ChatSwitcher.show();
    }

    /**
     * Time how long it takes a link to be tapped or something...
     */
    timeNavigation() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        Navigator.navigate(ROUTES.SETTINGS);
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    render() {
        return (
            <SafeAreaViewWrapper style={[styles.flexRow]}>
                {insets => (
                    <Sidebar
                        insets={insets}
                        onLinkClick={this.timeNavigation}
                        onAvatarClick={this.navigateToSettings}
                        isCreateMenuActive={this.state.isCreateMenuActive}
                        toggleCreateMenu={this.toggleCreateMenu}
                        onCreateMenuItemSelected={this.onCreateMenuItemSelected}
                    />
                )}
            </SafeAreaViewWrapper>
        );
    }
}

SidebarPage.propTypes = propTypes;
SidebarPage.defaultProps = defaultProps;

export default compose(
    withOnyx(
        {
            network: {
                key: ONYXKEYS.NETWORK,
            },
        },
    ),
    withWindowDimensions,
)(SidebarPage);
