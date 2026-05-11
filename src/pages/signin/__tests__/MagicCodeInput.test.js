import React from 'react';
import {render, screen} from '@testing-library/react-native';
import MagicCodeInput from '../MagicCodeInput';
import * as Localize from '@libs/Localize';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({
    translate: jest.fn((key) => {
        if (key === 'common.magicCodeCaution') {
            return 'Only enter this code on the official Expensify website or app.';
        }
        return key;
    }),
})));

describe('MagicCodeInput', () => {
    it('should display caution message below the input', () => {
        render(<MagicCodeInput />);
        expect(screen.getByText('Only enter this code on the official Expensify website or app.')).toBeTruthy();
    });
});