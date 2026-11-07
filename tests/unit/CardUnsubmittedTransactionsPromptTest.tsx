import {render, screen} from '@testing-library/react-native';

import CardUnsubmittedTransactionsPrompt from '@components/CardUnsubmittedTransactionsPrompt';
import RenderHTML from '@components/RenderHTML';

import Navigation from '@libs/Navigation/Navigation';

import mockTranslations from '@src/languages/en';

import React from 'react';

const mockCloseModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => () => ({closeModal: mockCloseModal}));
jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: 'https://new.expensify.com'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, url: string) => {
        const description = key.split('.').at(-1);
        if (description !== 'removeCardDescription' && description !== 'unassignCardDescription' && description !== 'unassignCardsDescription') {
            throw new Error(`Unexpected description: ${key}`);
        }
        return mockTranslations.workspace.moreFeatures.companyCards[description](url);
    },
}));
jest.mock('@components/RenderHTML', () => jest.fn(() => null));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

describe('CardUnsubmittedTransactionsPrompt', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each(['removeCardDescription', 'unassignCardDescription', 'unassignCardsDescription'] as const)('links %s without confirming removal', (description) => {
        // Given any of the three removal warnings and the affected card IDs
        render(
            <CardUnsubmittedTransactionsPrompt
                cardIDs={[123, 456]}
                descriptionKey={`workspace.moreFeatures.companyCards.${description}`}
            />,
        );
        const props = jest.mocked(RenderHTML).mock.calls.at(-1)?.at(0);

        // Then only the approved phrase is linked, with both cards and both unsubmitted statuses
        expect(props?.html).toContain('">unsubmitted transactions</a>');
        expect(props?.html).toContain('cardID%3A123%2C456');
        expect(decodeURIComponent(props?.html ?? '')).toContain('status:unreported,drafts');
        expect(props?.html).toContain('including unreported transactions and those on draft reports. This can’t be undone.');

        // When inspecting expenses through the hyperlink
        // RenderHTML receives a no-argument handler, but its public anchor callback also accepts native event details.
        Reflect.apply(props?.onLinkPress ?? (() => {}), undefined, []);

        // Then the confirmation is closed without a CONFIRM result before navigating to Spend
        expect(mockCloseModal).toHaveBeenCalledWith();
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('search?q='));
        expect(mockCloseModal.mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(Navigation.navigate).mock.invocationCallOrder.at(0) ?? 0);
    });

    it.each(['removeCardDescription', 'unassignCardDescription', 'unassignCardsDescription'] as const)('keeps %s visible without a link when the card list is empty', (description) => {
        // Given no card IDs
        // When rendering the warning prompt
        render(
            <CardUnsubmittedTransactionsPrompt
                cardIDs={[]}
                descriptionKey={`workspace.moreFeatures.companyCards.${description}`}
            />,
        );

        // Then the full deletion warning remains visible, but there is no clickable HTML or navigation
        expect(screen.getByText(mockTranslations.workspace.moreFeatures.companyCards[description]('').replace('<a href="">', '').replace('</a>', ''))).toBeTruthy();
        expect(RenderHTML).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(mockCloseModal).not.toHaveBeenCalled();
    });
});
