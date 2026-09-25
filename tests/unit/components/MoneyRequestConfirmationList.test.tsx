import {render} from '@testing-library/react-native';

import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import DistanceConfirmationList from '@components/MoneyRequestConfirmationList/variants/DistanceConfirmationList';
import InvoiceConfirmationList from '@components/MoneyRequestConfirmationList/variants/InvoiceConfirmationList';
import ManualConfirmationList from '@components/MoneyRequestConfirmationList/variants/ManualConfirmationList';
import PerDiemConfirmationList from '@components/MoneyRequestConfirmationList/variants/PerDiemConfirmationList';
import ScanConfirmationList from '@components/MoneyRequestConfirmationList/variants/ScanConfirmationList';
import TimeConfirmationList from '@components/MoneyRequestConfirmationList/variants/TimeConfirmationList';

import CONST from '@src/CONST';
import type {IOUAction, IOURequestType} from '@src/CONST';

import React from 'react';

import {transactionR14932 as mockTransaction} from '../../../__mocks__/reportData/transactions';

// Every variant renders nothing, so these tests assert which one the dispatcher called rather than what it drew.
jest.mock('@components/MoneyRequestConfirmationList/variants/InvoiceConfirmationList', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationList/variants/PerDiemConfirmationList', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationList/variants/TimeConfirmationList', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationList/variants/ScanConfirmationList', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationList/variants/DistanceConfirmationList', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationList/variants/ManualConfirmationList', () => jest.fn(() => null));

type RenderOptions = {
    /** The request type the transaction carries, which is what the scan and distance branches read */
    requestType?: IOURequestType;

    action?: IOUAction;
    iouType?: MoneyRequestConfirmationListProps['iouType'];

    /** Derived by the page from the request type it was opened with, not from the transaction */
    isPerDiemRequest?: boolean;
    isTimeRequest?: boolean;
};

function renderConfirmationList({requestType, action = CONST.IOU.ACTION.CREATE, iouType = CONST.IOU.TYPE.SUBMIT, isPerDiemRequest, isTimeRequest}: RenderOptions = {}) {
    // The scan and distance branches read only `iouRequestType`, so the rest of the transaction is incidental.
    const transaction = {...mockTransaction, iouRequestType: requestType};
    return render(
        <MoneyRequestConfirmationList
            transaction={transaction}
            action={action}
            iouType={iouType}
            isPerDiemRequest={isPerDiemRequest}
            isTimeRequest={isTimeRequest}
            selectedParticipants={[]}
            receiptOptions={{shouldDisplayReceipt: false}}
            onOpenParticipantPicker={jest.fn()}
        />,
    );
}

const requestTypeCases: Array<[IOURequestType | undefined, jest.Mock | typeof ManualConfirmationList]> = [
    [CONST.IOU.REQUEST_TYPE.SCAN, ScanConfirmationList],
    [CONST.IOU.REQUEST_TYPE.DISTANCE, DistanceConfirmationList],
    [CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, DistanceConfirmationList],
    [CONST.IOU.REQUEST_TYPE.DISTANCE_GPS, DistanceConfirmationList],
    [CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL, DistanceConfirmationList],
    [CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, DistanceConfirmationList],
    [CONST.IOU.REQUEST_TYPE.MANUAL, ManualConfirmationList],
];

describe('MoneyRequestConfirmationList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each(requestTypeCases)('should select the matching variant for the %s request type', (requestType, expected) => {
        // Given a transaction carrying that request type

        // When the confirmation list is rendered
        renderConfirmationList({requestType});

        // Then the variant for that type is the one used
        expect(jest.mocked(expected)).toHaveBeenCalled();
    });

    it('should select the invoice variant from the IOU type rather than the request type', () => {
        // Given an invoice, which carries no request type of its own

        // When the confirmation list is rendered
        renderConfirmationList({iouType: CONST.IOU.TYPE.INVOICE});

        // Then the invoice variant is used
        expect(jest.mocked(InvoiceConfirmationList)).toHaveBeenCalled();
    });

    it('should select the invoice variant ahead of the request type', () => {
        // Given an invoice that also reports a per-diem request, which the invoice branch has to win
        // When the confirmation list is rendered
        renderConfirmationList({iouType: CONST.IOU.TYPE.INVOICE, isPerDiemRequest: true});

        // Then the invoice variant is used rather than the per-diem one
        expect(jest.mocked(InvoiceConfirmationList)).toHaveBeenCalled();
        expect(jest.mocked(PerDiemConfirmationList)).not.toHaveBeenCalled();
    });

    it('should select the per-diem variant for a per-diem expense being created', () => {
        // Given a per-diem expense confirmed with the CREATE action

        // When the confirmation list is rendered
        renderConfirmationList({isPerDiemRequest: true});

        // Then the per-diem variant is used
        expect(jest.mocked(PerDiemConfirmationList)).toHaveBeenCalled();
    });

    it('should select the manual variant for a per-diem expense being moved off a track expense', () => {
        // Given a per-diem expense confirmed with the SUBMIT action, which submits through RequestMoney

        // When the confirmation list is rendered
        renderConfirmationList({isPerDiemRequest: true, action: CONST.IOU.ACTION.SUBMIT});

        // Then it confirms as a plain expense rather than a per-diem one
        expect(jest.mocked(ManualConfirmationList)).toHaveBeenCalled();
        expect(jest.mocked(PerDiemConfirmationList)).not.toHaveBeenCalled();
    });

    it('should select the time variant for a time expense being created', () => {
        // Given a time expense confirmed with the CREATE action

        // When the confirmation list is rendered
        renderConfirmationList({isTimeRequest: true});

        // Then the time variant is used
        expect(jest.mocked(TimeConfirmationList)).toHaveBeenCalled();
    });

    it('should select the manual variant for a time expense confirmed outside CREATE', () => {
        // Given a time expense confirmed with the SUBMIT action, which shows Merchant and no hours or rate

        // When the confirmation list is rendered
        renderConfirmationList({isTimeRequest: true, action: CONST.IOU.ACTION.SUBMIT});

        // Then it confirms as a plain expense rather than a time one
        expect(jest.mocked(ManualConfirmationList)).toHaveBeenCalled();
        expect(jest.mocked(TimeConfirmationList)).not.toHaveBeenCalled();
    });

    it('should select the manual variant when the transaction carries no request type', () => {
        // Given a transaction with no request type, as a pay confirmation has

        // When the confirmation list is rendered
        renderConfirmationList();

        // Then the manual variant is used, since it is the residual
        expect(jest.mocked(ManualConfirmationList)).toHaveBeenCalled();
    });
});
