import {render, screen} from '@testing-library/react-native';

import BrokenConnectionDescription from '@components/BrokenConnectionDescription';
import Text from '@components/Text';

import CONST from '@src/CONST';
import type {TransactionViolations} from '@src/types/onyx';

import React from 'react';

const mockUseTransactionViolations = jest.fn<TransactionViolations, unknown[]>();
const mockTranslate = jest.fn((key: string) => {
    if (key === 'violations.brokenConnection530Error') {
        return 'Receipt pending due to broken bank connection';
    }
    if (key === 'violations.brokenConnection531Error') {
        return "Can't auto-match receipt due to a temporary bank issue. Please try again later.";
    }
    return key;
});

jest.mock('@hooks/useTransactionViolations', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseTransactionViolations(...args),
}));
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environmentURL: ''})));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: mockTranslate}),
}));

const renderDescription = () =>
    render(
        <Text>
            <BrokenConnectionDescription
                transactionID="1"
                report={undefined}
                policy={undefined}
            />
        </Text>,
    );

describe('BrokenConnectionDescription', () => {
    afterEach(() => {
        mockUseTransactionViolations.mockReset();
        mockTranslate.mockClear();
    });

    it('shows the temporary retry-later message for a 531 broken card connection', () => {
        mockUseTransactionViolations.mockReturnValue([
            {
                name: 'rter',
                type: 'violation',
                data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531},
            },
        ] as TransactionViolations);

        renderDescription();

        expect(screen.getByText("Can't auto-match receipt due to a temporary bank issue. Please try again later.")).toBeTruthy();
    });

    it('prefers the 530 message when both 530 and 531 broken connections are present', () => {
        mockUseTransactionViolations.mockReturnValue([
            {
                name: 'rter',
                type: 'violation',
                data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531},
            },
            {
                name: 'rter',
                type: 'violation',
                data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530},
            },
        ] as TransactionViolations);

        renderDescription();

        expect(screen.getByText('Receipt pending due to broken bank connection')).toBeTruthy();
    });
});
