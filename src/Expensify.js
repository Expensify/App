import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import listenToStorageEvents from './libs/listenToStorageEvents';
import * as ActiveClientManager from './libs/ActiveClientManager';
import ONYXKEYS from './ONYXKEYS';
import NavigationRoot from './libs/Navigation/NavigationRoot';
import Log from './libs/Log';
import migrateOnyx from './libs/migrateOnyx';
import styles from './styles/styles';
import PushNotification from './libs/Notification/PushNotification';
import UpdateAppModal from './components/UpdateAppModal';

// Initialize the store when the app loads for the first time
Onyx.init({
    keys: ONYXKEYS,
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    initialKeyStates: {

        // Clear any loading and error messages so they do not appear on app startup
        [ONYXKEYS.SESSION]: {loading: false},
        [ONYXKEYS.ACCOUNT]: {loading: false, error: ''},
        [ONYXKEYS.NETWORK]: {isOffline: false},
        [ONYXKEYS.IOU]: {loading: false},
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

    // Session info for the currently logged in user.
    session: PropTypes.shape({
        // Currently logged in user authToken
        authToken: PropTypes.string,

        // Currently logged in user accountID
        accountID: PropTypes.number,
    }),

    // Whether a new update is available and ready to install.
    updateAvailable: PropTypes.bool,
};

const defaultProps = {
    session: {
        authToken: null,
        accountID: null,
    },
    updateAvailable: false,
};

class Expensify extends PureComponent {
    constructor(props) {
        super(props);

        // Initialize this client as being an active client
        ActiveClientManager.init();

        this.state = {
            isOnyxMigrated: false,
        };
    }

    componentDidMount() {
        // Run any Onyx schema migrations and then continue loading the main app
        migrateOnyx()
            .then(() => {
                this.setState({isOnyxMigrated: true});
            });
    }

    componentDidUpdate(prevProps) {
        const previousAccountID = lodashGet(prevProps, 'session.accountID', null);
        const currentAccountID = lodashGet(this.props, 'session.accountID', null);
        if (currentAccountID && (currentAccountID !== previousAccountID)) {
            PushNotification.register(currentAccountID);
        }
    }

    render() {
        // Display a blank page until the onyx migration completes
        if (!this.state.isOnyxMigrated) {
            return (
                <View style={styles.genericView} />
            );
        }

        const authToken = lodashGet(this.props, 'session.authToken', null);
        return (
            <>
                {/* We include the modal for showing a new update at the top level so the option is always present. */}
                {this.props.updateAvailable ? <UpdateAppModal /> : null}
                <NavigationRoot authenticated={Boolean(authToken)} />
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
    updateAvailable: {
        key: ONYXKEYS.UPDATE_AVAILABLE,
        initWithStoredValues: false,
    },
})(Expensify);
