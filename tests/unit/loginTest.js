/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: `react-test-renderer` renderer must be required after react-native.
import renderer from 'react-test-renderer';
import App from '../../src/App';

describe('AppComponent', () => {
    it('renders correctly', () => {
        renderer.create(<App />);
    });
});
