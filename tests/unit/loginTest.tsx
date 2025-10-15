import {render} from '@testing-library/react-native';
import React from 'react';
import 'react-native';
import App from '@src/App';

describe('AppComponent', () => {
    it('renders correctly', () => {
        render(<App />);
    });
});
