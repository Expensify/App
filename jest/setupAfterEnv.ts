import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxConnectionManager from 'react-native-onyx/dist/OnyxConnectionManager';

jest.useRealTimers();

afterAll(() => {
    OnyxConnectionManager.disconnectAll();
    return Onyx.clear();
});
