/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: `react-test-renderer` renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from '../../src/App';
import Expensify from '../../src/Expensify';

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
