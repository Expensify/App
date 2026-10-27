import {act, render} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import TaxFieldDropdown from '@components/MoneyRequestConfirmationList/sections/TaxFieldDropdown';
import type {TaxPickerModalProps} from '@components/TaxPicker/TaxPickerModal';

import {setMoneyRequestTaxRateValues} from '@libs/actions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// Only the write matters here, so the action is stubbed to record what it is asked to save.
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/IOU/MoneyRequest'),
    setMoneyRequestTaxRateValues: jest.fn(),
}));

// The currency list lives in a provider the form is rendered without here. USD has two decimals.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));

// The list itself is covered by the TaxPickerModal tests; here only what the dropdown hands it, and what it does with a pick, matter.
type MockTaxPickerModalProps = Pick<TaxPickerModalProps, 'transactionID' | 'selectedTaxRate' | 'action' | 'onSelected'>;
let mockTaxPickerModalProps: MockTaxPickerModalProps | undefined;
jest.mock('@components/TaxPicker/TaxPickerModal', () => (props: MockTaxPickerModalProps) => {
    mockTaxPickerModalProps = props;
    return null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';
const STANDARD_TAX_CODE = 'id_TAX_RATE_1';
const REDUCED_TAX_CODE = 'id_TAX_RATE_2';

// A $100 expense, stored negative as the expense-report amounts the tax is worked out from are. At the reduced
// rate of 10% the tax included in $100 is $9.09, which is 909 in the smallest unit the draft keeps.
const EXPENSE_AMOUNT = -10000;
const REDUCED_TAX_AMOUNT = 909;

const policy: Policy = {
    ...createRandomPolicy(1),
    outputCurrency: 'USD',
    taxRates: {
        name: 'VAT',
        defaultExternalID: STANDARD_TAX_CODE,
        defaultValue: '5%',
        foreignTaxDefault: STANDARD_TAX_CODE,
        taxes: {
            [STANDARD_TAX_CODE]: {name: 'Standard', value: '5%'},
            [REDUCED_TAX_CODE]: {name: 'Reduced', value: '10%'},
        },
    },
};

describe('TaxFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockTaxPickerModalProps = undefined;
        jest.mocked(setMoneyRequestTaxRateValues).mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('writes the picked rate and its tax amount into the draft expense', async () => {
        // Given a draft expense of $100 at the workspace's standard rate
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            amount: EXPENSE_AMOUNT,
            currency: 'USD',
            taxCode: STANDARD_TAX_CODE,
            taxValue: '5%',
        });
        await waitForBatchedUpdates();

        // When the tax rate row's dropdown opens on the create form and the user picks the reduced rate
        render(
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <TaxFieldDropdown
                    isVisible
                    onClose={jest.fn()}
                    anchorPosition={{horizontal: 0, vertical: 0}}
                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                    shouldMeasureAnchorPositionFromTop
                    shouldSwitchPositionIfOverflow={false}
                    popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
                    popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
                    transactionID={TRANSACTION_ID}
                    policy={policy}
                    selectedTaxRate="Standard (5%)"
                />
            </ConfirmationFieldsProvider>,
        );
        await waitForBatchedUpdates();
        expect(mockTaxPickerModalProps?.transactionID).toBe(TRANSACTION_ID);
        expect(mockTaxPickerModalProps?.selectedTaxRate).toBe('Standard (5%)');
        expect(mockTaxPickerModalProps?.action).toBe(CONST.IOU.ACTION.CREATE);
        act(() => mockTaxPickerModalProps?.onSelected?.({code: REDUCED_TAX_CODE, keyForList: 'Reduced (10%)-1', text: 'Reduced (10%)'}));

        // Then the draft is saved with the reduced rate, its value and the tax amount recalculated from the expense's
        // amount, the same as picking it on the full-page selector
        expect(setMoneyRequestTaxRateValues).toHaveBeenCalledTimes(1);
        expect(setMoneyRequestTaxRateValues).toHaveBeenCalledWith(TRANSACTION_ID, {taxCode: REDUCED_TAX_CODE, taxValue: '10%', taxAmount: REDUCED_TAX_AMOUNT});
    });
});
