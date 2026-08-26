import {render, screen} from '@testing-library/react-native';

import BrokenConnectionDescription from '@components/BrokenConnectionDescription';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseTransactionViolations = jest.fn<TransactionViolations, unknown[]>();
jest.mock('@hooks/useTransactionViolations', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseTransactionViolations(...args),
}));

const renderDescription = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <Text>
                <BrokenConnectionDescription
                    transactionID="1"
                    report={undefined}
                    policy={undefined}
                />
            </Text>
        </ComposeProviders>,
    );

describe('BrokenConnectionDescription', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    afterEach(() => {
        mockUseTransactionViolations.mockReset();
    });

    it('shows the temporary retry-later message for a 531 broken card connection', async () => {
        mockUseTransactionViolations.mockReturnValue([
            {
                name: 'rter',
                type: 'violation',
                data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531},
            },
        ] as TransactionViolations);

        renderDescription();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText("Can't auto-match receipt due to a temporary bank issue. Please try again later.")).toBeTruthy();
    });

    it('prefers the 530 message when both 530 and 531 broken connections are present', async () => {
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
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Receipt pending due to broken bank connection')).toBeTruthy();
    });
});
