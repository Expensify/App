import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import AskConciergeEmptyState from '@pages/inbox/report/AskConciergeEmptyState';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({ConciergeBot: 'ConciergeBot'}),
}));

describe('AskConciergeEmptyState', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdates();
    });

    it('renders the Ask Concierge prompt', () => {
        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <AskConciergeEmptyState />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        expect(screen.getByTestId('AskConciergeEmptyState')).toBeTruthy();
        expect(screen.getByText('Ask me anything!')).toBeTruthy();
        expect(screen.getByText('Concierge can answer questions, update expenses, and more.')).toBeTruthy();
    });
});
