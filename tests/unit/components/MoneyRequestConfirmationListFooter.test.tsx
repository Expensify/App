import {render} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import MoneyRequestConfirmationListFooter from '@components/MoneyRequestConfirmationListFooter';
import type {MoneyRequestConfirmationListFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';
import DistanceManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceManualFooter';
import DistanceMapFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceMapFooter';
import DistanceOdometerFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceOdometerFooter';
import InvoiceFooter from '@components/MoneyRequestConfirmationListFooter/variants/InvoiceFooter';
import ManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/ManualFooter';
import PerDiemFooter from '@components/MoneyRequestConfirmationListFooter/variants/PerDiemFooter';
import ScanFooter from '@components/MoneyRequestConfirmationListFooter/variants/ScanFooter';
import TimeFooter from '@components/MoneyRequestConfirmationListFooter/variants/TimeFooter';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';

import React from 'react';

// Every variant renders nothing, so these tests assert which one the footer called rather than what it drew.
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/InvoiceFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/PerDiemFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/TimeFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/DistanceManualFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/DistanceOdometerFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/DistanceMapFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/ScanFooter', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestConfirmationListFooter/variants/ManualFooter', () => jest.fn(() => null));

/** The expense-type discriminators the footer selects on. All default to false, as they do in the provider. */
type ExpenseMode = {
    isScanRequest?: boolean;
    isPerDiemRequest?: boolean;
    isTimeRequest?: boolean;
    isDistanceRequest?: boolean;
    isManualDistanceRequest?: boolean;
    isOdometerDistanceRequest?: boolean;
};

const footerProps: MoneyRequestConfirmationListFooterProps = {
    isCompactMode: false,
    policy: undefined,
    policyTags: undefined,
    selectedParticipants: [],
    distanceData: {
        distance: 0,
        hasRoute: false,
        unit: undefined,
        distanceRateName: undefined,
        distanceRateCurrency: 'USD',
        mileageRate: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, currency: 'USD'},
        expenseDate: undefined,
        customUnitRateID: undefined,
    },
    amountDisplay: {amount: 0, formattedAmount: '', formattedAmountPerAttendee: ''},
    requiredFlags: {isCategoryRequired: false, isMerchantRequired: false, isDescriptionRequired: false},
    visibilityFlags: {
        shouldShowSmartScanFields: false,
        shouldShowAmountField: false,
        shouldShowMerchant: false,
        shouldShowCategories: false,
        shouldShowTax: false,
        isParticipantPickerVisible: false,
    },
    errorState: {shouldDisplayFieldError: false, formError: '', clearFormErrors: jest.fn(), setFormError: jest.fn()},
    receiptOptions: {receiptFilename: '', receiptPath: '', shouldDisplayReceipt: false},
    compactControls: {showMoreFields: false, setShowMoreFields: jest.fn()},
};

const renderFooter = (mode: ExpenseMode, action: IOUAction = CONST.IOU.ACTION.CREATE, iouType: typeof CONST.IOU.TYPE.SUBMIT | typeof CONST.IOU.TYPE.INVOICE = CONST.IOU.TYPE.SUBMIT) =>
    render(
        <ConfirmationFieldsProvider
            transactionID="transactionID"
            reportID="reportID"
            action={action}
            iouType={iouType}
            {...mode}
        >
            <MoneyRequestConfirmationListFooter {...footerProps} />
        </ConfirmationFieldsProvider>,
    );

const cases: Array<[ExpenseMode, React.ComponentType<never>]> = [
    [{isPerDiemRequest: true}, PerDiemFooter],
    [{isTimeRequest: true}, TimeFooter],
    [{isDistanceRequest: true, isManualDistanceRequest: true}, DistanceManualFooter],
    [{isDistanceRequest: true, isOdometerDistanceRequest: true}, DistanceOdometerFooter],
    [{isDistanceRequest: true}, DistanceMapFooter],
    [{isScanRequest: true}, ScanFooter],
    [{}, ManualFooter],
];

describe('MoneyRequestConfirmationListFooter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each(cases)('should select the matching variant for %s', (mode, expected) => {
        // Given an expense whose type is described by those discriminators

        // When the footer is rendered
        renderFooter(mode);

        // Then the variant for that type is the one used
        expect(jest.mocked(expected)).toHaveBeenCalled();
    });

    it('should select the invoice footer from the IOU type rather than a mode flag', () => {
        // Given an invoice, which carries no request type of its own

        // When the footer is rendered
        renderFooter({}, CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.INVOICE);

        // Then the invoice footer is used
        expect(jest.mocked(InvoiceFooter)).toHaveBeenCalled();
    });

    it('should select the manual footer for a per-diem expense being moved off a track expense', () => {
        // Given a per-diem expense confirmed with the SUBMIT action, which submits through RequestMoney

        // When the footer is rendered
        renderFooter({isPerDiemRequest: true}, CONST.IOU.ACTION.SUBMIT);

        // Then it confirms as a plain expense rather than a per-diem one
        expect(jest.mocked(ManualFooter)).toHaveBeenCalled();
        expect(jest.mocked(PerDiemFooter)).not.toHaveBeenCalled();
    });

    it('should select the manual footer for a time expense being moved off a track expense', () => {
        // Given a time expense confirmed with the SUBMIT action, which shows Merchant and no hours or rate

        // When the footer is rendered
        renderFooter({isTimeRequest: true}, CONST.IOU.ACTION.SUBMIT);

        // Then it confirms as a plain expense rather than a time one
        expect(jest.mocked(ManualFooter)).toHaveBeenCalled();
        expect(jest.mocked(TimeFooter)).not.toHaveBeenCalled();
    });
});
