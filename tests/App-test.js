/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: `react-test-renderer` renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {MemoryRouter} from 'react-router-dom';


import App from '../src/App';
import SignInPage from '../src/page/SignInPage';

jest.mock('../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));
jest.mock('../node_modules/@react-native-community/netinfo',
    () => require('./mocks/@react-native-community/netinfo'));
jest.mock('../node_modules/react-native-config',
    () => require('./mocks/react-native-config'));

it('renders correctly', () => {
    renderer.create(<App />);
});

describe('SampleComponent', () => {
    test('should render', () => {
        const component = renderer
            .create(
                <MemoryRouter>
                    <SignInPage />
                </MemoryRouter>
            )
            .toJSON();

        expect(component).toMatchSnapshot();
    });
});
