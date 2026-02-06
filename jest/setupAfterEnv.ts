/**
 * Jest-only Onyx subscription tracking to prevent subscriber accumulation across tests/files.
 */
/* eslint-disable rulesdir/prefer-onyx-connect-in-libs, rulesdir/no-onyx-connect */
import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {Connection} from 'react-native-onyx/dist/OnyxConnectionManager';
import OnyxConnectionManager from 'react-native-onyx/dist/OnyxConnectionManager';
import type {ConnectOptions, OnyxKey} from 'react-native-onyx/dist/types';

jest.useRealTimers();

type OnyxTrackingState = {
    persistentConnections: Map<string, Connection>;
    testConnections: Map<string, Connection>;
    isTestExecutionPhase: boolean;
    disconnectConnection: (connection: Connection) => void;
};

type GlobalWithOnyxTracking = typeof globalThis & {
    onyxTrackingState?: OnyxTrackingState;
};

const globalWithOnyxTracking = globalThis as GlobalWithOnyxTracking;

if (!globalWithOnyxTracking.onyxTrackingState) {
    const persistentConnections = new Map<string, Connection>();
    const testConnections = new Map<string, Connection>();
    const originalConnect = Onyx.connect.bind(Onyx);
    const originalConnectWithoutView = Onyx.connectWithoutView.bind(Onyx);
    const originalConnectionManagerConnect = OnyxConnectionManager.connect.bind(OnyxConnectionManager);
    const originalConnectionManagerDisconnect = OnyxConnectionManager.disconnect.bind(OnyxConnectionManager);

    const getConnectionIdentifier = (connection: Connection) => `${connection.id}_${connection.callbackID}`;

    const disconnectConnection = (connection: Connection) => {
        originalConnectionManagerDisconnect(connection);
        const connectionID = getConnectionIdentifier(connection);
        persistentConnections.delete(connectionID);
        testConnections.delete(connectionID);
    };

    const trackConnection = (connection: Connection): Connection => {
        const connectionID = getConnectionIdentifier(connection);
        if (globalWithOnyxTracking.onyxTrackingState?.isTestExecutionPhase) {
            testConnections.set(connectionID, connection);
            persistentConnections.delete(connectionID);
        } else {
            persistentConnections.set(connectionID, connection);
        }

        return connection;
    };

    OnyxConnectionManager.connect = <TKey extends OnyxKey>(connectOptions: ConnectOptions<TKey>): Connection => trackConnection(originalConnectionManagerConnect(connectOptions));
    OnyxConnectionManager.disconnect = (connection: Connection): void => {
        disconnectConnection(connection);
    };

    Onyx.connect = <TKey extends OnyxKey>(connectOptions: ConnectOptions<TKey>): Connection => trackConnection(originalConnect(connectOptions));
    Onyx.connectWithoutView = <TKey extends OnyxKey>(connectOptions: ConnectOptions<TKey>): Connection => trackConnection(originalConnectWithoutView(connectOptions));

    globalWithOnyxTracking.onyxTrackingState = {
        persistentConnections,
        testConnections,
        isTestExecutionPhase: false,
        disconnectConnection,
    };
}

beforeEach(() => {
    if (!globalWithOnyxTracking.onyxTrackingState) {
        return;
    }

    globalWithOnyxTracking.onyxTrackingState.isTestExecutionPhase = true;
});

afterEach(() => {
    const trackingState = globalWithOnyxTracking.onyxTrackingState;
    if (!trackingState) {
        return;
    }

    trackingState.isTestExecutionPhase = false;

    for (const connection of trackingState.testConnections.values()) {
        trackingState.disconnectConnection(connection);
    }

    trackingState.testConnections.clear();
});

afterAll(() => {
    const trackingState = globalWithOnyxTracking.onyxTrackingState;
    if (!trackingState) {
        return;
    }

    for (const connection of trackingState.persistentConnections.values()) {
        trackingState.disconnectConnection(connection);
    }

    trackingState.persistentConnections.clear();
});
