import {render, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import TaxFields from '@components/MoneyRequestConfirmationList/sections/TaxFields';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
// The currency list lives in a provider the form is rendered without here. USD has two decimals.
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$'), convertToDisplayString: jest.fn(() => '$0.00')})),
}));
// The tax amount input beside the row is its own component with its own tests.
jest.mock('@components/NumberWithSymbolForm', () => () => null);

let mockIsAnchoredDropdownsBetaEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: (beta: string) => mockIsAnchoredDropdownsBetaEnabled && beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.ANCHORED_FIELD_DROPDOWNS,
}));

// Records what the row decided and renders its list straight away, so each test can read both without pressing anything.
let mockShouldOpenInDropdown: boolean | undefined;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    return ({shouldOpenInDropdown, renderDropdown}: {shouldOpenInDropdown: boolean; renderDropdown: (props: ExpenseFieldDropdownRenderProps) => ReactNode}) => {
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

type RenderParams = {
    action?: IOUAction;
    canModifyTaxFields?: boolean;
    didConfirm?: boolean;
    /** Workspace the form has. `null` renders the row without one, as a tracked expense being moved does */
    taxPolicy?: Policy | null;
    movingPolicy?: Policy;
};

const renderTaxRateRow = ({action = CONST.IOU.ACTION.CREATE, canModifyTaxFields = true, didConfirm = false, taxPolicy = policy, movingPolicy}: RenderParams = {}) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={action}
            iouType={CONST.IOU.TYPE.SUBMIT}
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
                    clearFormErrors={jest.fn()}
                />
            </ExpenseFormLayoutContext.Provider>
        </ConfirmationFieldsProvider>,
    );

describe('TaxFields', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        mockShouldOpenInDropdown = undefined;
        mockDropdownPolicyID = undefined;
        jest.mocked(Navigation.navigate).mockClear();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID, reportID: REPORT_ID, amount: -10000, currency: 'USD'});
        await waitForBatchedUpdates();
    });

    it('opens the tax rate list in place while creating an expense', async () => {
        // Given a workspace with a tax rate and the anchored dropdowns beta on
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

    it('keeps the full-page selector when the beta is off', async () => {
        // Given a workspace with a tax rate, for a user without the anchored dropdowns beta
        mockIsAnchoredDropdownsBetaEnabled = false;

        // When the form renders the tax rate row
        renderTaxRateRow();

        // Then the row opens the full-page selector as before
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

    it('keeps the full-page selector when editing a saved expense', async () => {
        // Given a workspace with a tax rate, and an expense that already exists
        // When the form renders the tax rate row to edit it
        renderTaxRateRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row keeps the full-page selector, as the category and tag rows do for edits
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });
});
