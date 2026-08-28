import {render} from '@testing-library/react-native';

import App from '@src/App';

import 'react-native';
import React from 'react';

describe('AppComponent', () => {
    it('renders correctly', () => {
        render(<App />);
    });
});
