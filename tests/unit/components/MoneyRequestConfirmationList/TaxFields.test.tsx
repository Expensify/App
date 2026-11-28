import {render, waitFor} from '@testing-library/react-native';

import type {DropdownFieldRenderProps} from '@components/DropdownField';
import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import TaxFields from '@components/MoneyRequestConfirmationList/sections/TaxFields';

import Navigation from '@libs/Navigation/Navigation';
import {getCalculatedTaxAmount} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string, ...params: unknown[]) => [key, ...params].join(' '), preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
// The currency list lives in a provider the form is rendered without here. USD has two decimals, and an amount displays as its raw value.
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({
        getCurrencyDecimals: jest.fn(() => 2),
        getCurrencySymbol: jest.fn(() => '$'),
        convertToDisplayString: jest.fn((amount: number) => `display:${amount}`),
    })),
}));
// The tax amount input beside the row is its own component with its own tests, so here it only records the error and the read-only state it is given.
let mockTaxAmountErrorText: string | undefined;
let mockIsTaxAmountInputReadOnly: boolean | undefined;
jest.mock('@components/NumberWithSymbolForm', () => ({errorText, readOnly}: {errorText?: string; readOnly?: boolean}) => {
    mockTaxAmountErrorText = errorText;
    mockIsTaxAmountInputReadOnly = readOnly;
    return null;
});

// Records what the row decided and renders its list straight away, so each test can read both without pressing anything.
let mockShouldOpenInDropdown: boolean | undefined;
jest.mock('@components/DropdownField', () => {
    return ({shouldOpenInDropdown, renderDropdown}: {shouldOpenInDropdown: boolean; renderDropdown: (props: DropdownFieldRenderProps) => ReactNode}) => {
        mockShouldOpenInDropdown = shouldOpenInDropdown;
        return renderDropdown({
            isVisible: true,
            onClose: () => {},
            anchorPosition: {horizontal: 0, vertical: 0},
            anchorAlignment: {horizontal: 'left', vertical: 'top'},
            shouldMeasureAnchorPositionFromTop: true,
            shouldSwitchPositionIfOverflow: false,
            popoverWidth: 300,
            popoverHeight: 300,
        });
    };
});

let mockDropdownPolicyID: string | undefined;
jest.mock('@components/MoneyRequestConfirmationList/sections/TaxFieldDropdown', () => ({policy}: {policy?: Policy}) => {
    mockDropdownPolicyID = policy?.id;
    return null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';
const STANDARD_TAX_CODE = 'id_TAX_RATE_1';

const taxRates = {
    name: 'VAT',
    defaultExternalID: STANDARD_TAX_CODE,
    defaultValue: '5%',
    foreignTaxDefault: STANDARD_TAX_CODE,
    taxes: {[STANDARD_TAX_CODE]: {name: 'Standard', value: '5%'}},
};

const policy: Policy = {...createRandomPolicy(1), id: 'policy1', outputCurrency: 'USD', taxRates};
const policyWithoutRates: Policy = {...policy, taxRates: {...taxRates, taxes: {}}};
const policyForMovingExpenses: Policy = {...createRandomPolicy(2), id: 'policy2', outputCurrency: 'USD', taxRates};
const draftTransaction = createMock<Transaction>({transactionID: TRANSACTION_ID, reportID: REPORT_ID, amount: -10000, currency: 'USD'});

type RenderParams = {
    action?: IOUAction;
    canModifyTaxFields?: boolean;
    didConfirm?: boolean;
    /** Workspace the form has. `null` renders the row without one, as a tracked expense being moved does */
    taxPolicy?: Policy | null;
    movingPolicy?: Policy;
    taxAmountError?: TranslationPaths;
    isDiscardModalVisible?: boolean;
};

const renderTaxRateRow = ({
    action = CONST.IOU.ACTION.CREATE,
    canModifyTaxFields = true,
    didConfirm = false,
    taxPolicy = policy,
    movingPolicy,
    taxAmountError,
    isDiscardModalVisible = false,
}: RenderParams = {}) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={action}
            iouType={CONST.IOU.TYPE.SUBMIT}
            isDiscardModalVisible={isDiscardModalVisible}
        >
            <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                <TaxFields
                    policy={taxPolicy ?? undefined}
                    policyForMovingExpenses={movingPolicy}
                    iouCurrencyCode="USD"
                    canModifyTaxFields={canModifyTaxFields}
                    didConfirm={didConfirm}
                    transactionID={TRANSACTION_ID}
                    action={action}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    reportID={REPORT_ID}
                    formError=""
                    taxAmountError={taxAmountError}
                />
            </ExpenseFormLayoutContext.Provider>
        </ConfirmationFieldsProvider>,
    );

describe('TaxFields', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockShouldOpenInDropdown = undefined;
        mockDropdownPolicyID = undefined;
        mockTaxAmountErrorText = undefined;
        mockIsTaxAmountInputReadOnly = undefined;
        jest.mocked(Navigation.navigate).mockClear();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, draftTransaction);
        await waitForBatchedUpdates();
    });

    it('opens the tax rate list in place while creating an expense', async () => {
        // Given a workspace with a tax rate
        // When the expense form renders the tax rate row
        renderTaxRateRow();

        // Then the row opens its list in a container anchored to it, picking from that workspace, rather than pushing the full-page selector
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockDropdownPolicyID).toBe(policy.id);
    });

    it("lists the destination workspace's rates for a tracked expense being moved", async () => {
        // Given a tracked expense being submitted to a workspace, which the form does not have as `policy` yet
        // When the form renders the tax rate row
        renderTaxRateRow({action: CONST.IOU.ACTION.SUBMIT, taxPolicy: null, movingPolicy: policyForMovingExpenses});

        // Then the row's list picks from the workspace the expense is moving to, the same one the row shows the rate of
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockDropdownPolicyID).toBe(policyForMovingExpenses.id);
    });

    it("lists the destination workspace's rates when the expense's own workspace has none, for a tracked expense being moved", async () => {
        // Given a tracked expense being submitted from a workspace without tax rates to one that has them
        // When the form renders the tax rate row
        renderTaxRateRow({action: CONST.IOU.ACTION.SUBMIT, taxPolicy: {...policy, taxRates: undefined}, movingPolicy: policyForMovingExpenses});

        // Then the row's list picks from the workspace the expense is moving to, as the row's own title does
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockDropdownPolicyID).toBe(policyForMovingExpenses.id);
    });

    it('keeps the full-page selector when the workspace has no rates to pick', async () => {
        // Given a workspace whose tax rates are all gone, which the full page shows an empty list for
        // When the form renders the tax rate row
        renderTaxRateRow({taxPolicy: policyWithoutRates});

        // Then the row keeps opening the full-page selector
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('does not open the list on a form whose tax cannot be changed, or that was already confirmed', async () => {
        // Given a workspace with a tax rate
        // When the row renders where the tax fields are locked, and then on a form that was already confirmed
        renderTaxRateRow({canModifyTaxFields: false});
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
        renderTaxRateRow({didConfirm: true});

        // Then neither opens a list the user can no longer change anything from
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it.each([
        {condition: 'the discard prompt covers the form', isDiscardModalVisible: true, didConfirm: false, isReadOnly: true},
        {condition: 'the expense was confirmed', isDiscardModalVisible: false, didConfirm: true, isReadOnly: true},
        {condition: 'the user is entering the tax amount', isDiscardModalVisible: false, didConfirm: false, isReadOnly: false},
    ])('makes the tax amount input read-only only when it must not take focus: $condition', async ({isDiscardModalVisible, didConfirm, isReadOnly}) => {
        // Given a workspace with a tax rate, on a form where the tax can be changed
        // When the tax amount input renders while the discard prompt shows, after the expense was confirmed, or during normal entry
        renderTaxRateRow({isDiscardModalVisible, didConfirm});

        // Then the prompt keeps the input from taking the focus iOS restores after a cancelled back swipe, and a confirmed
        // expense stays locked, since the input's read-only flag takes precedence over its disabled one
        await waitFor(() => {
            expect(mockIsTaxAmountInputReadOnly).toBe(isReadOnly);
        });
    });

    it('keeps the full-page selector when editing a saved expense', async () => {
        // Given a workspace with a tax rate, and an expense that already exists
        // When the form renders the tax rate row to edit it
        renderTaxRateRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row keeps the full-page selector, as the category and tag rows do for edits
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('names the maximum the rate allows in the over-the-limit tax amount error', async () => {
        // Given a confirm blocked by a tax amount above what the expense's rate allows
        // When the form renders the tax amount input
        renderTaxRateRow({taxAmountError: 'iou.error.invalidTaxAmount'});

        // Then the input's error names the maximum for this rate and amount, since the error key alone can't carry it
        const maxTaxAmount = getCalculatedTaxAmount(policy, draftTransaction, 'USD', 2);
        expect(maxTaxAmount).toBeGreaterThan(0);
        await waitFor(() => {
            expect(mockTaxAmountErrorText).toBe(`iou.error.invalidTaxAmount display:${maxTaxAmount}`);
        });
    });

    it('shows the required tax amount error without a limit', async () => {
        // Given a confirm blocked by an emptied tax amount
        // When the form renders the tax amount input
        renderTaxRateRow({taxAmountError: 'common.error.fieldRequired'});

        // Then the input shows that error on its own, since an empty amount has no limit to name
        await waitFor(() => {
            expect(mockTaxAmountErrorText).toBe('common.error.fieldRequired');
        });
    });
});
