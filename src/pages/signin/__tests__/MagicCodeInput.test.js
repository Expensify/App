import React from 'react';
import {render, screen} from '@testing-library/react-native';
import MagicCodeInput from '../MagicCodeInput';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key) => {
        if (key === 'common.magicCode') return 'Magic code';
        if (key === 'common.magicCodeCaution') return 'Only enter this code if you requested to sign in. Do not share it with anyone.';
        return key;
    },
}));

describe('MagicCodeInput', () => {
    it('renders the caution message when showCautionMessage is true', () => {
        render(
            <MagicCodeInput
                value=""
                onChangeText={() => {}}
                showCautionMessage
            />
        );

        expect(screen.getByText('Only enter this code if you requested to sign in. Do not share it with anyone.')).toBeTruthy();
    });

    it('does not render the caution message when showCautionMessage is false', () => {
        render(
            <MagicCodeInput
                value=""
                onChangeText={() => {}}
                showCautionMessage={false}
            />
        );

        expect(screen.queryByText('Only enter this code if you requested to sign in. Do not share it with anyone.')).toBeNull();
    });

    it('renders the input with correct label', () => {
        render(
            <MagicCodeInput
                value=""
                onChangeText={() => {}}
            />
        );

        expect(screen.getByText('Magic code')).toBeTruthy();
    });
});