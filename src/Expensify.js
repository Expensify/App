import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {View, AppState} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import _ from 'underscore';

import BootSplash from './libs/BootSplash';
import listenToStorageEvents from './libs/listenToStorageEvents';
import * as ActiveClientManager from './libs/ActiveClientManager';
import ONYXKEYS from './ONYXKEYS';
import CONST from './CONST';
import NavigationRoot from './libs/Navigation/NavigationRoot';
import Log from './libs/Log';
import migrateOnyx from './libs/migrateOnyx';
import styles from './styles/styles';
import PushNotification from './libs/Notification/PushNotification';
import UpdateAppModal from './components/UpdateAppModal';
import Visibility from './libs/Visibility';
import GrowlNotification from './components/GrowlNotification';
import {growlRef} from './libs/Growl';
import Navigation from './libs/Navigation/Navigation';
import ROUTES from './ROUTES';
import StartupTimer from './libs/StartupTimer';
import {setRedirectToWorkspaceNewAfterSignIn} from './libs/actions/Session';

// Initialize the store when the app loads for the first time
Onyx.init({
    keys: ONYXKEYS,
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    initialKeyStates: {

        // Clear any loading and error messages so they do not appear on app startup
        [ONYXKEYS.SESSION]: {loading: false, shouldShowComposeInput: true},
        [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
        [ONYXKEYS.NETWORK]: {isOffline: false},
        [ONYXKEYS.IOU]: {
            loading: false, error: false, creatingIOUTransaction: false, isRetrievingCurrency: false,
        },
        [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
    },
    registerStorageEventListener: (onStorageEvent) => {
        listenToStorageEvents(onStorageEvent);
    },
});
Onyx.registerLogger(({level, message}) => {
    if (level === 'alert') {
        Log.alert(message, 0, {}, false);
    } else {
        Log.client(message);
    }
});

const propTypes = {
    /* Onyx Props */

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({

        /** Currently logged in user authToken */
        authToken: PropTypes.string,

        /** Currently logged in user accountID */
        accountID: PropTypes.number,

        /** Should app immediately redirect to new workspace route once authenticated */
        redirectToWorkspaceNewAfterSignIn: PropTypes.bool,
    }),

    /** Whether a new update is available and ready to install. */
    updateAvailable: PropTypes.bool,

    /** Whether the initial data needed to render the app is ready */
    initialReportDataLoaded: PropTypes.bool,

    /** Tells us if the sidebar has rendered */
    isSidebarLoaded: PropTypes.bool,

    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    session: {
        authToken: null,
        accountID: null,
        redirectToWorkspaceNewAfterSignIn: false,
    },
    updateAvailable: false,
    initialReportDataLoaded: false,
    isSidebarLoaded: false,
    betas: [],
};

class Expensify extends PureComponent {
    constructor(props) {
        super(props);

        // Initialize this client as being an active client
        ActiveClientManager.init();
        this.hideSplash = this.hideSplash.bind(this);
        this.initializeClient = this.initializeClient.bind(true);
        this.state = {
            isOnyxMigrated: false,
        };
    }

    componentDidMount() {
        // This timer is set in the native layer when launching the app and we stop it here so we can measure how long
        // it took for the main app itself to load.
        StartupTimer.stop();

        // Run any Onyx schema migrations and then continue loading the main app
        migrateOnyx()
            .then(() => {
                // When we don't have an authToken we'll want to show the sign in screen immediately so we'll hide our
                // boot screen right away
                if (!this.getAuthToken()) {
                    this.hideSplash();

                    // In case of a crash that led to disconnection, we want to remove all the push notifications.
                    PushNotification.clearNotifications();
                }

                this.setState({isOnyxMigrated: true});
            });

        AppState.addEventListener('change', this.initializeClient);
    }

    componentDidUpdate(prevProps) {
        const previousAccountID = lodashGet(prevProps, 'session.accountID', null);
        const currentAccountID = lodashGet(this.props, 'session.accountID', null);
        if (currentAccountID && (currentAccountID !== previousAccountID)) {
            PushNotification.register(currentAccountID);
        }

        // If we previously had no authToken and now have an authToken we'll want to reshow the boot splash screen so
        // that we can remove it again once the content is ready
        const previousAuthToken = lodashGet(prevProps, 'session.authToken', null);
        if (this.getAuthToken() && !previousAuthToken) {
            BootSplash.show({fade: true});
        }

        if (this.getAuthToken()
            && !_.isEmpty(this.props.betas)
            && lodashGet(this.props, 'session.redirectToWorkspaceNewAfterSignIn', false)) {
            setRedirectToWorkspaceNewAfterSignIn(false);
            Navigation.navigate(ROUTES.WORKSPACE_NEW);
        }

        if (this.getAuthToken() && this.props.initialReportDataLoaded && this.props.isSidebarLoaded) {
            BootSplash.getVisibilityStatus()
                .then((value) => {
                    if (value !== 'visible') {
                        return;
                    }

                    this.hideSplash();
                });
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.initializeClient);
    }

    getAuthToken() {
        return lodashGet(this.props, 'session.authToken', null);
    }

    initializeClient() {
        if (Visibility.isVisible()) {
            ActiveClientManager.init();
        }
    }

    hideSplash() {
        BootSplash.hide({fade: true});
    }

    render() {
        // Display a blank page until the onyx migration completes
        if (!this.state.isOnyxMigrated) {
            return (
                <View style={styles.genericView} />
            );
        }
        return (
            <>
                <GrowlNotification ref={growlRef} />
                {/* We include the modal for showing a new update at the top level so the option is always present. */}
                {this.props.updateAvailable ? <UpdateAppModal /> : null}
                <NavigationRoot authenticated={Boolean(this.getAuthToken())} />
            </>
        );
    }
}

Expensify.propTypes = propTypes;
Expensify.defaultProps = defaultProps;
export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
    updateAvailable: {
        key: ONYXKEYS.UPDATE_AVAILABLE,
        initWithStoredValues: false,
    },
    initialReportDataLoaded: {
        key: ONYXKEYS.INITIAL_REPORT_DATA_LOADED,
    },
    isSidebarLoaded: {
        key: ONYXKEYS.IS_SIDEBAR_LOADED,
    },
})(Expensify);
