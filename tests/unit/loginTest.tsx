import React from 'react';
import 'react-native';
// Note: `react-test-renderer` renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from '@src/App';

jest.mock('../../modules/background-task/src/NativeReactNativeBackgroundTask', () => ({
    defineTask: jest.fn(),
    onBackgroundTaskExecution: jest.fn(),
}));

// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

describe('AppComponent', () => {
    it('renders correctly', () => {
        renderer.create(<App />);
    });
});
