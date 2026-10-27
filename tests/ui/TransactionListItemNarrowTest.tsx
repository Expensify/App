import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import TransactionListItemNarrow from '@components/Search/SearchList/ListItem/TransactionListItem/TransactionListItemNarrow';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import CONST from '@src/CONST';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@components/Search/SearchSelectionProvider', () => ({
    useRowSelection: jest.fn(() => ({isSelected: false})),
}));

// The real row needs the whole Search snapshot, and these tests only care about the user info above it.
jest.mock('@components/TransactionItemRow', () => () => null);

// Render a marker for the user info so the tests can check whether the row asked for it.
jest.mock('@components/Search/SearchList/ListItem/UserInfoAndActionButtonRow', () => {
    const {Text: MockText} = jest.requireActual<{Text: React.ComponentType<{testID: string; children?: React.ReactNode}>}>('react-native');
    return ({shouldShowUserInfo, item}: {shouldShowUserInfo: boolean; item: TransactionListItemType}) =>
        shouldShowUserInfo ? <MockText testID="narrow-row-user-info">{item.formattedFrom}</MockText> : null;
});

const cardholderAccountID = 1;

function makeItem(reportID: string): TransactionListItemType {
    return createMock<TransactionListItemType>({
        transactionID: '1',
        reportID,
        keyForList: '1',
        from: {accountID: cardholderAccountID, displayName: 'Cardholder', avatar: ''},
        to: {accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE, avatar: ''},
        formattedFrom: 'Cardholder',
    });
}

function renderRow(item: TransactionListItemType, isDeletedTransaction: boolean) {
    return render(
        <ComposeProviders components={[ThemeProvider, ThemeStylesProvider]}>
            <TransactionListItemNarrow
                item={item}
                isDeletedTransaction={isDeletedTransaction}
                showTooltip={false}
                onSelectRow={jest.fn()}
                transactionViolations={[]}
                handleActionButtonPress={jest.fn()}
                transactionPreviewData={{hasParentReport: false, hasParentReportAction: false, hasTransaction: false, hasTransactionThreadReport: false}}
                reportActions={[]}
            />
        </ComposeProviders>,
    );
}

describe('TransactionListItemNarrow', () => {
    it('shows From for a deleted expense', () => {
        // Given a deleted expense whose From resolved to the cardholder
        const item = makeItem(CONST.REPORT.TRASH_REPORT_ID);

        // When the row renders in the narrow layout used on mobile web and native
        renderRow(item, true);

        // Then the cardholder is shown, matching the From column in the wide layout
        expect(screen.getByTestId('narrow-row-user-info')).toBeOnTheScreen();
        expect(screen.getByText('Cardholder')).toBeOnTheScreen();
    });

    it('still shows From for an active expense', () => {
        // Given an active expense on a regular report
        const item = makeItem('100');

        // When the row renders in the narrow layout
        renderRow(item, false);

        // Then From is shown as before
        expect(screen.getByTestId('narrow-row-user-info')).toBeOnTheScreen();
    });
});
