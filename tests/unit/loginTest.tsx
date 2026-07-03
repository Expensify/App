import App from '@src/App';

import {render} from '@testing-library/react-native';
import 'react-native';
import React from 'react';

describe('AppComponent', () => {
    it('renders correctly', () => {
        render(<App />);
    });
});
