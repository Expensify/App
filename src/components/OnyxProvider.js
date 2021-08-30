import React from 'react';
import Onyx from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';
import ComposeProviders from './ComposeProviders';
import CONST from '../CONST';
import Log from '../libs/Log';
import listenToStorageEvents from '../libs/listenToStorageEvents';
import {canCaptureOnyxMetrics} from '../libs/canCaptureMetrics';

// Initialize the store when the app loads for the first time
Onyx.init({
    keys: ONYXKEYS,
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    captureMetrics: canCaptureOnyxMetrics(),
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

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withNetwork, NetworkProvider] = createOnyxContext(ONYXKEYS.NETWORK);
const [withPersonalDetails, PersonalDetailsProvider] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [
    withReportActionsDrafts,
    ReportActionsDraftsProvider,
] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

const OnyxProvider = props => (
    <ComposeProviders
        components={[
            NetworkProvider,
            PersonalDetailsProvider,
            ReportActionsDraftsProvider,
            CurrentDateProvider,
        ]}
    >
        {props.children}
    </ComposeProviders>
);

OnyxProvider.displayName = 'OnyxProvider';
OnyxProvider.propTypes = propTypes;

export default OnyxProvider;

export {
    withNetwork,
    withPersonalDetails,
    withReportActionsDrafts,
    withCurrentDate,
};
