import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import AskConciergeEmptyState from '@pages/inbox/report/AskConciergeEmptyState';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({ConciergeBot: 'ConciergeBot'}),
}));

describe('AskConciergeEmptyState', () => {
    it('renders the Ask Concierge prompt', () => {
        render(
            <OnyxListItemProvider>
                <AskConciergeEmptyState />
            </OnyxListItemProvider>,
        );

        expect(screen.getByTestId('AskConciergeEmptyState')).toBeTruthy();
        expect(screen.getByText('Ask me anything!')).toBeTruthy();
        expect(screen.getByText('Concierge can answer questions, update expenses, and more.')).toBeTruthy();
    });
});
