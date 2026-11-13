import {render} from '@testing-library/react-native';

import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import type {ConfirmationFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ScanConfirmationList from '@components/MoneyRequestConfirmationList/variants/ScanConfirmationList';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';

let mockFieldErrors: ConfirmationFieldErrors = {};
let mockFormError: TranslationPaths | '' = '';
let mockTransactionID = 'txn1';

jest.mock('@components/MoneyRequestConfirmationList/hooks/useConfirmationListData', () => () => ({
    layoutProps: {transactionID: mockTransactionID},
    footerProps: {errorState: {fieldErrors: mockFieldErrors, formError: mockFormError}},
    taxControllerProps: {},
    splitBillControllerProps: {},
    fieldAutoSelectProps: {},
}));
jest.mock('@components/MoneyRequestConfirmationList/ConfirmationListLayout', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationList/TaxController', () => () => null);
jest.mock('@components/MoneyRequestConfirmationList/SplitBillController', () => () => null);
jest.mock('@components/MoneyRequestConfirmationList/FieldAutoSelector', () => () => null);
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/ScanFooter', () => () => null);
jest.mock('@hooks/useIsInLandscapeMode', () => () => false);

const mockedLayout = jest.mocked(ConfirmationListLayout);

// A fresh scan the user hasn't typed anything into, so nothing on its own opens "Show more"
const untouchedScan = {
    transactionID: 'txn1',
    reportID: 'report1',
    amount: 0,
    currency: 'USD',
    merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
    created: '2026-11-05',
    comment: {},
    iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
} as OnyxTypes.Transaction;

const listProps: MoneyRequestConfirmationListProps = {
    transaction: untouchedScan,
    iouType: CONST.IOU.TYPE.SUBMIT,
    action: CONST.IOU.ACTION.CREATE,
    selectedParticipants: [],
    onOpenParticipantPicker: () => {},
    receiptOptions: {shouldDisplayReceipt: true},
    canEnterScanFieldsManually: true,
};

function isLastRenderCompact(): boolean | undefined {
    return mockedLayout.mock.calls.at(-1)?.at(0)?.isCompactMode;
}

describe('ScanConfirmationList', () => {
    beforeEach(() => {
        mockFieldErrors = {};
        mockFormError = '';
        mockTransactionID = 'txn1';
        mockedLayout.mockClear();
    });

    it('keeps the fields collapsed behind "Show more" while nothing needs them', () => {
        // Given an untouched scan with no field errors
        // When it renders
        render(<ScanConfirmationList {...listProps} />);

        // Then the receipt fills the screen and the fields stay collapsed, since SmartScan will fill them in
        expect(isLastRenderCompact()).toBe(true);
    });

    it('opens "Show more" when a blocked confirm reveals field errors, so pressing Create does not look like it did nothing', () => {
        // Given a scan whose fields are collapsed
        const {rerender} = render(<ScanConfirmationList {...listProps} />);
        expect(isLastRenderCompact()).toBe(true);

        // When a confirm is blocked by its missing amount and the field errors are revealed
        mockFieldErrors = {amount: 'common.error.fieldRequired'};
        rerender(<ScanConfirmationList {...listProps} />);

        // Then the fields expand, so the amount shows its error under the input
        expect(isLastRenderCompact()).toBe(false);
    });

    it('opens "Show more" for an attendee error only on the receipt it was raised on', () => {
        // Given a multi-scan whose receipt on screen has its fields collapsed
        const {rerender} = render(<ScanConfirmationList {...listProps} />);

        // When a confirm is blocked by missing attendees, an error only the attendees field behind "Show more" shows
        mockFormError = 'violations.missingAttendees';
        rerender(<ScanConfirmationList {...listProps} />);

        // Then the fields expand, so the error is on screen
        expect(isLastRenderCompact()).toBe(false);

        // When the user pages to another receipt while that error is still set
        mockTransactionID = 'txn2';
        rerender(
            <ScanConfirmationList
                {...listProps}
                transaction={{...untouchedScan, transactionID: 'txn2'}}
            />,
        );

        // Then that receipt stays collapsed, since every receipt shares the form error and this one doesn't have it
        expect(isLastRenderCompact()).toBe(true);
    });
});
