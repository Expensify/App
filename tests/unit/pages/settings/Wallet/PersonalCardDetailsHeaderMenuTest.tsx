import {render, screen} from '@testing-library/react-native';

import PersonalCardDetailsHeaderMenu from '@pages/settings/Wallet/PersonalCardDetailsHeaderMenu';

import type {Card} from '@src/types/onyx';

import React from 'react';

import createMock from '../../../../utils/createMock';

jest.mock('@components/MenuItem/presets/MenuItemField', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode; testID?: string}>>>('react-native');
    return ({value}: {value?: string}) => <Text testID="menuItemFieldValue">{value}</Text>;
});

jest.mock('@components/MenuItem', () => {
    function MockMenuItem() {
        return null;
    }
    MockMenuItem.BrickRoadIndicator = () => null;
    return MockMenuItem;
});

jest.mock('@components/MenuItem/presets/MenuItemAction', () => () => null);
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => () => null);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'es'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@userActions/Card', () => ({clearCardErrorField: jest.fn(), clearCardNameValuePairsErrorField: jest.fn(), setPersonalCardReimbursable: jest.fn()}));

function renderHeaderMenu(scrapeMinDate: string) {
    render(
        <PersonalCardDetailsHeaderMenu
            card={createMock<Card>({cardID: 1, scrapeMinDate})}
            cardID="1"
            cardholder={undefined}
            customCardNames={undefined}
            expensifyIcons={{}}
            isCSVImportedPersonalCard={false}
            reimbursableSetting={false}
            isOffline={false}
            shouldShowBreakConnection={false}
            onBreakConnection={jest.fn()}
            onUnassignCard={jest.fn()}
        />,
    );
}

describe('PersonalCardDetailsHeaderMenu', () => {
    it('shows the transaction start date in the reader language rather than as stored', () => {
        // Given a card whose transaction start date is stored in the machine format
        // When its details header is shown to a Spanish reader
        renderHeaderMenu('2026-09-18');

        // Then the row reads a Spanish date, because the stored value is not meant for display
        expect(screen.getByText('18 sept 2026')).toBeOnTheScreen();
        expect(screen.queryByText('2026-09-18')).not.toBeOnTheScreen();
    });

    it('leaves the transaction start date empty rather than throwing on an unparsable value', () => {
        // Given a card whose stored start date cannot be parsed
        // When its details header is shown
        renderHeaderMenu('not-a-date');

        // Then the start date row is empty, because the old date-fns formatting threw on an invalid date
        expect(screen.getAllByTestId('menuItemFieldValue').at(1)).toHaveTextContent('');
    });
});
