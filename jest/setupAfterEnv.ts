/**
 * Jest-only Onyx subscription tracking to prevent subscriber accumulation across test files.
 */
/* eslint-disable rulesdir/prefer-onyx-connect-in-libs, rulesdir/no-onyx-connect */
import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {Connection} from 'react-native-onyx/dist/OnyxConnectionManager';
import type {ConnectOptions, OnyxKey} from 'react-native-onyx/dist/types';

jest.useRealTimers();

type OnyxTrackingState = {
    trackedConnections: Map<string, Connection>;
};

type GlobalWithOnyxTracking = typeof globalThis & {
    onyxTrackingState?: OnyxTrackingState;
};

const globalWithOnyxTracking = globalThis as GlobalWithOnyxTracking;

if (!globalWithOnyxTracking.onyxTrackingState) {
    const trackedConnections = new Map<string, Connection>();
    const originalConnect = Onyx.connect.bind(Onyx);
    const originalConnectWithoutView = Onyx.connectWithoutView.bind(Onyx);

    const trackConnection = (connection: Connection): Connection => {
        trackedConnections.set(`${connection.id}_${connection.callbackID}`, connection);
        return connection;
    };

    Onyx.connect = <TKey extends OnyxKey>(connectOptions: ConnectOptions<TKey>): Connection => trackConnection(originalConnect(connectOptions));
    Onyx.connectWithoutView = <TKey extends OnyxKey>(connectOptions: ConnectOptions<TKey>): Connection => trackConnection(originalConnectWithoutView(connectOptions));

    globalWithOnyxTracking.onyxTrackingState = {
        trackedConnections,
    };
}

afterAll(() => {
    const trackedConnections = globalWithOnyxTracking.onyxTrackingState?.trackedConnections;
    if (!trackedConnections) {
        return;
    }

    for (const connection of trackedConnections.values()) {
        Onyx.disconnect(connection);
    }

    trackedConnections.clear();
});
