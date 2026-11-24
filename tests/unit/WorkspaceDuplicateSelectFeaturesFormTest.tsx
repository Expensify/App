import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContext} from '@components/LocaleContextProvider';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';

import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {toIndexMap} from '@libs/RuleUtils';

import WorkspaceDuplicateSelectFeaturesForm from '@pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm';

import {duplicateWorkspace} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Rule from '@src/types/onyx/Rule';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = '1';
const TARGET_POLICY_ID = '2';

const travelProvisioningMarkers: Array<Partial<Policy>> = [
    {travelSettings: {spotnanaEntityID: 'source-entity'}},
    {travelSettings: {spotnanaCompanyID: 'source-company'}},
    {travelSettings: {associatedTravelDomainAccountID: '123'}},
    {isTravelProvisioned: true},
];

type CapturedSelectionListProps = {
    data: ListItem[];
    footerContent?: React.JSX.Element;
    onSelectRow: (item: ListItem) => void;
    confirmButtonOptions: ConfirmButtonOptions<ListItem>;
};
let mockSelectionListProps: CapturedSelectionListProps | undefined;

// Capture selection and consent controls without rendering the list.
jest.mock('@components/SelectionList', () => ({
    __esModule: true,
    default: (props: CapturedSelectionListProps) => {
        mockSelectionListProps = props;
        return props.footerContent ?? null;
    },
}));

jest.mock('@components/RenderHTML', () => ({__esModule: true, default: () => null}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useRoute: () => ({params: {policyID: POLICY_ID}}),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    closeRHPFlow: jest.fn(),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn(() => Promise.resolve({action: 'cancel'}))}),
}));

// Capture requests without making API calls.
jest.mock('@userActions/Policy/Policy', () => ({
    openDuplicatePolicyPage: jest.fn(),
    duplicateWorkspace: jest.fn(),
}));

const MERCHANT_RULE: Rule = {
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: POLICY_ID,
    triggers: toIndexMap([CONST.RULES.TRIGGERS.CREATE_TRANSACTION]),
    filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Acme'},
    actions: toIndexMap([{name: CONST.RULES.ACTIONS.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.CATEGORY, value: 'Travel'}]),
};

/** Uses eReceipts to control whether the Rules row appears. */
function createSourcePolicy(hasWorkspaceRules: boolean): Policy {
    return {
        ...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.CORPORATE),
        areRulesEnabled: true,
        preventSelfApproval: false,
        maxExpenseAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE,
        maxExpenseAmount: CONST.DISABLED_MAX_EXPENSE_VALUE,
        maxExpenseAge: CONST.DISABLED_MAX_EXPENSE_VALUE,
        eReceipts: hasWorkspaceRules,
    };
}

async function renderForm(hasWorkspaceRules: boolean, overrides: Partial<Policy> = {}) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {...createSourcePolicy(hasWorkspaceRules), ...overrides});
    await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}merchantRule`, MERCHANT_RULE);
    await Onyx.set(ONYXKEYS.RAM_ONLY_HAS_RULES_DATA_BEEN_FETCHED, true);
    await Onyx.set(ONYXKEYS.DUPLICATE_WORKSPACE, {name: 'Duplicate', policyID: TARGET_POLICY_ID});
    await waitForBatchedUpdates();

    render(
        <LocaleContext.Provider value={createMock<LocaleContextProps>({translate: TestHelper.translateLocal, numberFormat: (number) => String(number)})}>
            <OnyxListItemProvider>
                <WorkspaceDuplicateSelectFeaturesForm policyID={POLICY_ID} />
            </OnyxListItemProvider>
        </LocaleContext.Provider>,
    );
    await waitForBatchedUpdates();
}

function getRow(key: string): ListItem | undefined {
    return mockSelectionListProps?.data.find((item) => item.keyForList === key);
}

async function pressRow(key: string) {
    const row = getRow(key);
    expect(row).toBeDefined();
    if (!row) {
        return;
    }
    act(() => {
        mockSelectionListProps?.onSelectRow(row);
    });
    await waitForBatchedUpdates();
}

function pressContinue() {
    act(() => {
        mockSelectionListProps?.confirmButtonOptions.onConfirm?.();
    });
}

function getSentParts(): Part[] | undefined {
    return jest.mocked(duplicateWorkspace).mock.calls.at(0)?.[1].parts;
}

describe('WorkspaceDuplicateSelectFeaturesForm Rules and Merchant rules', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        // Keep background requests local to the test.
        global.fetch = TestHelper.createGlobalFetchMock();
        mockSelectionListProps = undefined;
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    it('keeps Merchant rules selected independently when Rules is deselected', async () => {
        // Given both rule groups configured.
        await renderForm(true);
        expect(getRow('rules')?.isSelected).toBe(true);
        expect(getRow('codingRules')?.isSelected).toBe(true);

        // When only workspace Rules is deselected.
        await pressRow('rules');
        pressContinue();

        // Then merchant rules remain available independently.
        expect(getRow('codingRules')?.isSelected).toBe(true);
        expect(getSentParts()).not.toContain('rules');
        expect(getSentParts()).toContain('codingRules');
    });

    it('selects Merchant rules without selecting Rules', async () => {
        // Given both rule groups initially selected.
        await renderForm(true);
        // When Merchant rules alone is selected.
        await pressRow('rules');
        await pressRow('codingRules');

        await pressRow('codingRules');
        pressContinue();

        // Then selecting merchant rules does not force workspace Rules on.
        expect(getRow('rules')?.isSelected).toBe(false);
        expect(getRow('codingRules')?.isSelected).toBe(true);
        expect(getSentParts()).toContain('codingRules');
        expect(getSentParts()).not.toContain('rules');
    });

    it('keeps Rules selected when only Merchant rules is deselected', async () => {
        // Given independent workspace and merchant rules.
        await renderForm(true);

        // When only Merchant rules is deselected.
        await pressRow('codingRules');
        pressContinue();

        // Then workspace Rules stays selected.
        expect(getRow('rules')?.isSelected).toBe(true);
        expect(getSentParts()).toContain('rules');
        expect(getSentParts()).not.toContain('codingRules');
    });

    it('copies merchant rules on their own when the source has no workspace-level rules', async () => {
        // Given a source with merchant rules only.
        await renderForm(false);
        expect(getRow('rules')).toBeUndefined();
        expect(getRow('codingRules')?.isSelected).toBe(true);

        // When duplication is confirmed.
        pressContinue();

        // Then no unavailable workspace Rules part is sent.
        expect(getSentParts()).not.toContain('rules');
        expect(getSentParts()).toContain('codingRules');
    });
    it('omits source invoicing identity from the settings description', async () => {
        // Given invoice settings tied to the source workspace's identity.
        await renderForm(false, {areInvoicesEnabled: true, invoice: {markUp: 25, companyName: 'Source Company', companyWebsite: 'source.example.com'}});

        // When the shared settings list describes Invoices.
        const row = getRow('invoices');

        // Then the row cannot promise to copy the source's billing identity.
        expect(row).toBeDefined();
        expect(row?.alternateText ?? '').not.toContain('Source Company');
        expect(row?.alternateText ?? '').not.toContain('source.example.com');
    });

    it('ignores deleted categories when inferring Rules for a migrated Control workspace', async () => {
        // Given a migrated workspace whose only category rule is queued for deletion.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {
            Deleted: {name: 'Deleted', enabled: true, maxExpenseAmount: 5, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        });
        await renderForm(true, {areRulesEnabled: undefined});

        // When the settings list infers the missing Rules feature flag.
        const rules = getRow('rules');

        // Then a deleted category cannot turn Rules on again.
        expect(rules).toBeUndefined();
    });

    it('shows Rules when public receipt visibility is the only configured rule', async () => {
        // Given a Control workspace with public receipts and all other Rules settings at their defaults.
        await renderForm(false, {isReceiptVisibilityPublic: true});

        // When the settings selection is submitted.
        pressContinue();

        // Then Rules is available and included in the request so public receipt visibility is copied.
        expect(getRow('rules')?.isSelected).toBe(true);
        expect(getSentParts()).toContain('rules');
    });

    it('shows Rules when Agent rules are the only configured rules', async () => {
        // Given a Control workspace with only one saved Agent rule.
        await renderForm(false, {rules: {agentRules: {agent: {ruleID: 'agent', prompt: 'Require receipts', created: '2026-11-01'}}}});

        // When the settings selection is submitted.
        pressContinue();

        // Then Rules remains available alongside Merchant rules.
        expect(getRow('rules')?.isSelected).toBe(true);
        expect(getSentParts()).toContain('rules');
    });

    it('shows Reports when only custom export layouts are configured', async () => {
        // Given a legacy workspace with no report fields and one export layout.
        await renderForm(false, {fieldList: {}, exportLayouts: {custom: {name: 'Custom', templateName: 'custom', type: 'csv', policyID: POLICY_ID, description: ''}}});

        // When the selection is submitted.
        pressContinue();

        // Then Reports is offered so its export layout can be copied.
        expect(getSentParts()).toContain('reports');
        expect(getRow('reports')?.alternateText).toBe('Custom');
    });

    it('hides Invoices when a business bank account is its only configuration', async () => {
        // Given enabled Invoices with no transferable markup or invoice fields.
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {bank: {accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS}}});
        await renderForm(false, {areInvoicesEnabled: true, areInvoiceFieldsEnabled: false, invoice: {}, fieldList: {}});

        // When the selection is submitted.
        pressContinue();

        // Then an unrelated bank account does not make Invoices available.
        expect(getRow('invoices')).toBeUndefined();
        expect(getSentParts()).not.toContain('invoices');
    });

    it('keeps displayed Travel consent controlled after its footer remounts', async () => {
        // Given accepted consent for a provisioned source.
        await renderForm(false, {
            isTravelEnabled: true,
            travelSettings: {spotnanaEntityID: 'source'},
            address: {addressStreet: '1 Main St', country: 'US', city: 'New York', state: 'NY', zipCode: '10001'},
        });
        fireEvent.press(screen.getByRole('checkbox', {checked: false}));

        // When Travel is removed and selected again.
        await pressRow('travel');
        await pressRow('travel');

        // Then the displayed consent and enabled Continue button still agree.
        expect(screen.getAllByRole('checkbox', {checked: true})).toHaveLength(2);
        expect(mockSelectionListProps?.confirmButtonOptions.isDisabled).toBe(false);
        await pressRow('overview');
        pressContinue();
        expect(jest.mocked(duplicateWorkspace).mock.calls.at(0)?.[1].hasAcceptedTravelTerms).toBe(false);
        await pressRow('overview');
        expect(getRow('travel')?.isSelected).toBe(false);
    });

    it('includes Invoices when markup is the only invoice configuration', async () => {
        // Given enabled invoicing with markup and no company details, invoice fields, or bank accounts.
        await renderForm(false, {areInvoicesEnabled: true, areInvoiceFieldsEnabled: false, invoice: {markUp: 25}, fieldList: {}});

        // When the default selection is submitted.
        pressContinue();

        // Then markup remains available to copy even without other invoice configuration.
        expect(getRow('invoices')?.isSelected).toBe(true);
        expect(getRow('invoices')?.alternateText).toBe('Marked up by 25%');
        expect(getSentParts()).toContain('invoices');
    });

    it('hides Reports when its only export layout is queued for deletion', async () => {
        // Given no report fields and one deleted export layout.
        await renderForm(false, {
            fieldList: {},
            exportLayouts: {
                deleted: {name: 'Deleted', templateName: 'deleted', type: 'csv', policyID: POLICY_ID, description: '', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            },
        });

        // When the available settings are submitted.
        pressContinue();

        // Then an unavailable layout cannot make Reports selectable.
        expect(getRow('reports')).toBeUndefined();
        expect(getSentParts()).not.toContain('reports');
    });

    it('describes legacy rules and a single category without misleading counts', async () => {
        // Given one category and one legacy approval rule without a modern rules_ record.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Meals: {name: 'Meals', enabled: true}});
        await renderForm(false, {rules: {approvalRules: [{approver: '', applyWhen: []}]}});
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.RULE}merchantRule`, null));
        await waitForBatchedUpdates();

        // When the selection descriptions are rendered.
        const rules = getRow('codingRules');

        // Then the legacy-only row has a count and one category uses a grammatical label and value.
        expect(rules?.alternateText).toBe('1 expense default');
        expect(getRow('categories')?.alternateText).toBe('Categories: 1');
    });

    it('includes Time tracking and Receipt partners from the shared copy settings list', async () => {
        // Given configured time tracking and receipt partners.
        await renderForm(false, {units: {time: {enabled: true, rate: 75}}, receiptPartners: {enabled: true}});
        expect(getRow('timeTracking')?.isSelected).toBe(true);
        expect(getRow('receiptPartners')?.isSelected).toBe(true);
        // When duplication is confirmed.
        pressContinue();
        // Then both available settings are included.
        expect(getSentParts()).toEqual(expect.arrayContaining(['timeTracking', 'receiptPartners']));
    });

    it('requires Currency with Workflows when reimbursement currencies differ', async () => {
        // Given source reimbursement banking in another currency.
        await renderForm(false, {
            outputCurrency: 'EUR',
            achAccount: {bankAccountID: 123, accountNumber: '1234', routingNumber: '123456789', addressName: 'Test', bankName: 'Test bank', reimburser: 'test@example.com'},
            areWorkflowsEnabled: true,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });
        expect(getRow('workflows')?.isSelected).toBe(true);
        expect(getRow('currency')?.isSelected).toBe(true);
        expect(getRow('currency')?.isDisabled).toBe(true);
        // When the required Currency selection is pressed.
        await pressRow('currency');
        pressContinue();
        // Then Workflows keeps Currency selected for reimbursement compatibility.
        expect(getSentParts()).toEqual(expect.arrayContaining(['workflows', 'currency']));
    });

    it.each(travelProvisioningMarkers)('excludes Travel without Overview/address for provisioning marker %#', async (provisioningMarkers) => {
        // Given a provisioned source whose cached data may lack the new entity ID.
        await renderForm(false, {
            isTravelEnabled: true,
            ...provisioningMarkers,
            address: {addressStreet: '1 Main Street', city: 'Paris', country: 'FR', state: '', zipCode: '75001'},
        });
        expect(getRow('travel')?.isSelected).toBe(true);
        // When Overview is deselected.
        await pressRow('overview');
        // Then Travel is excluded because the new workspace lacks an address.
        expect(getRow('travel')?.isSelected).toBe(false);
        expect(getRow('travel')?.isDisabled).toBe(true);
        pressContinue();
        expect(getSentParts()).not.toContain('travel');
    });

    it.each(travelProvisioningMarkers)('selects Travel when Select all also adds Overview for provisioning marker %#', async (provisioningMarkers) => {
        // Given a provisioned Travel source with an address and all features initially selected.
        await renderForm(false, {
            isTravelEnabled: true,
            ...provisioningMarkers,
            address: {addressStreet: '1 Main Street', city: 'Paris', country: 'FR', state: '', zipCode: '75001'},
        });
        fireEvent.press(screen.getByRole('checkbox', {checked: true}));
        await waitForBatchedUpdates();
        expect(getRow('overview')?.isSelected).toBe(false);
        expect(getRow('travel')?.isDisabled).toBe(true);

        // When Select all is pressed from the empty selection.
        fireEvent.press(screen.getByRole('checkbox', {checked: false}));
        await waitForBatchedUpdates();

        // Then Overview and Travel are selected together, and Travel consent is still required.
        expect(getRow('overview')?.isSelected).toBe(true);
        expect(getRow('travel')?.isSelected).toBe(true);
        expect(mockSelectionListProps?.confirmButtonOptions.isDisabled).toBe(true);
        fireEvent.press(screen.getByRole('checkbox', {checked: false}));
        await waitForBatchedUpdates();
        pressContinue();
        expect(getSentParts()).toContain('travel');
    });

    it.each(travelProvisioningMarkers)('requires Travel consent before submitting for provisioning marker %#', async (provisioningMarkers) => {
        // Given a provisioned source that requires fresh consent for the duplicate.
        await renderForm(false, {
            isTravelEnabled: true,
            ...provisioningMarkers,
            address: {addressStreet: '1 Main Street', city: 'Paris', country: 'FR', state: '', zipCode: '75001'},
        });
        expect(mockSelectionListProps?.confirmButtonOptions.isDisabled).toBe(true);
        pressContinue();
        expect(duplicateWorkspace).not.toHaveBeenCalled();
        // When the user accepts the Travel terms.
        fireEvent.press(screen.getByRole('checkbox', {checked: false}));
        await waitForBatchedUpdates();
        expect(mockSelectionListProps?.confirmButtonOptions.isDisabled).toBe(false);
        pressContinue();
        // Then the API receives explicit consent.
        expect(jest.mocked(duplicateWorkspace).mock.calls.at(0)?.[1].hasAcceptedTravelTerms).toBe(true);
    });

    it('hides Rules when the source has workspace-level rules but Rules is turned off', async () => {
        // Given a Control source with Rules turned off that still has a workspace-level rule set and a merchant rule
        await renderForm(true, {areRulesEnabled: false});

        // Then the Rules row is not offered, while Merchant rules is still offered and selected
        expect(getRow('rules')).toBeUndefined();
        expect(getRow('codingRules')?.isSelected).toBe(true);

        // When the admin continues
        pressContinue();

        // Then Rules is not copied, so the duplicated workspace keeps Rules turned off like the source, and the merchant rules are copied on their own
        expect(getSentParts()).not.toContain('rules');
        expect(getSentParts()).toContain('codingRules');
    });
});
