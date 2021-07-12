/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: `react-test-renderer` renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from '../../src/App';

/* <App> uses <ErrorBoundary> and we need to mock the imported crashlytics module
* due to an error that happens otherwise https://github.com/invertase/react-native-firebase/issues/2475 */
jest.mock('@react-native-firebase/crashlytics', () => () => ({
    log: jest.fn(),
    recordError: jest.fn(),
}));

describe('AppComponent', () => {
    it('renders correctly', () => {
        renderer.create(<App />);
    });
});
