/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from '../src/App';

jest.mock('../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));
jest.mock('../node_modules/@react-native-community/netinfo',
    () => require('./mocks/@react-native-community/netinfo'));
jest.mock('../node_modules/react-native-config',
    () => require('./mocks/react-native-config'));

it('renders correctly', () => {
    renderer.create(<App />);
});
