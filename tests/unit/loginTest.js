/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: `react-test-renderer` renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from '../../src/App';
import Expensify from '../../src/Expensify';

jest.mock('../../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));
jest.mock('../../node_modules/@react-native-community/netinfo',
    () => require('./mocks/@react-native-community/netinfo'));
jest.mock('../../node_modules/@react-native-community/push-notification-ios',
    () => require('./mocks/@react-native-community/push-notification-ios'));
jest.mock('../../node_modules/react-native-config',
    () => require('./mocks/react-native-config'));
jest.mock('../../node_modules/react-native-image-picker',
    () => require('./mocks/react-native-image-picker'));
jest.mock('../../node_modules/urbanairship-react-native',
    () => require('./mocks/urbanairship-react-native'));

describe('AppComponent', () => {
    it('renders correctly', () => {
        renderer.create(<App />);
    });
});

describe('LoadingComponent', () => {
    it('should render loading screen first', () => {
        const component = renderer.create(<Expensify />).toJSON();
        expect(component).toMatchSnapshot();
    });
});
