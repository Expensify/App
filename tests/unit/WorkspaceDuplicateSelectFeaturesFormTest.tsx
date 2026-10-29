import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';

import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import {toIndexMap} from '@libs/RuleUtils';

import WorkspaceDuplicateSelectFeaturesForm from '@pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm';

import {duplicateWorkspace} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Rule from '@src/types/onyx/Rule';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = '1';
const TARGET_POLICY_ID = '2';

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
        <OnyxListItemProvider>
            <WorkspaceDuplicateSelectFeaturesForm policyID={POLICY_ID} />
        </OnyxListItemProvider>,
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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
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
        await renderForm(true);
        expect(getRow('rules')?.isSelected).toBe(true);
        expect(getRow('codingRules')?.isSelected).toBe(true);

        await pressRow('rules');
        pressContinue();

        expect(getRow('codingRules')?.isSelected).toBe(true);
        expect(getSentParts()).not.toContain('rules');
        expect(getSentParts()).toContain('codingRules');
    });

    it('selects Merchant rules without selecting Rules', async () => {
        await renderForm(true);
        await pressRow('rules');
        await pressRow('codingRules');

        await pressRow('codingRules');
        pressContinue();

        expect(getRow('rules')?.isSelected).toBe(false);
        expect(getRow('codingRules')?.isSelected).toBe(true);
        expect(getSentParts()).toContain('codingRules');
        expect(getSentParts()).not.toContain('rules');
    });

    it('keeps Rules selected when only Merchant rules is deselected', async () => {
        await renderForm(true);

        await pressRow('codingRules');
        pressContinue();

        expect(getRow('rules')?.isSelected).toBe(true);
        expect(getSentParts()).toContain('rules');
        expect(getSentParts()).not.toContain('codingRules');
    });

    it('copies merchant rules on their own when the source has no workspace-level rules', async () => {
        await renderForm(false);
        expect(getRow('rules')).toBeUndefined();
        expect(getRow('codingRules')?.isSelected).toBe(true);

        pressContinue();

        expect(getSentParts()).not.toContain('rules');
        expect(getSentParts()).toContain('codingRules');
    });
    it('includes Time tracking and Receipt partners from the shared copy settings list', async () => {
        await renderForm(false, {units: {time: {enabled: true, rate: 75}}, receiptPartners: {enabled: true}});
        expect(getRow('timeTracking')?.isSelected).toBe(true);
        expect(getRow('receiptPartners')?.isSelected).toBe(true);
        pressContinue();
        expect(getSentParts()).toEqual(expect.arrayContaining(['timeTracking', 'receiptPartners']));
    });

    it('requires Currency with Workflows when reimbursement currencies differ', async () => {
        await renderForm(false, {outputCurrency: 'EUR', achAccount: {bankAccountID: 123}, areWorkflowsEnabled: true, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        expect(getRow('workflows')?.isSelected).toBe(true);
        expect(getRow('currency')?.isSelected).toBe(true);
        expect(getRow('currency')?.isDisabled).toBe(true);
        await pressRow('currency');
        pressContinue();
        expect(getSentParts()).toEqual(expect.arrayContaining(['workflows', 'currency']));
    });

    it('excludes Travel when Overview is deselected and the new policy would have no address', async () => {
        await renderForm(false, {isTravelEnabled: true, address: {addressStreet: '1 Main Street', city: 'Paris', country: 'FR', state: '', zipCode: '75001'}});
        expect(getRow('travel')?.isSelected).toBe(true);
        await pressRow('overview');
        expect(getRow('travel')?.isSelected).toBe(false);
        expect(getRow('travel')?.isDisabled).toBe(true);
        pressContinue();
        expect(getSentParts()).not.toContain('travel');
    });

    it('requires Travel consent and sends it only after the checkbox is accepted', async () => {
        await renderForm(false, {
            isTravelEnabled: true,
            travelSettings: {spotnanaCompanyID: 'source-company'},
            address: {addressStreet: '1 Main Street', city: 'Paris', country: 'FR', state: '', zipCode: '75001'},
        });
        expect(mockSelectionListProps?.confirmButtonOptions.isDisabled).toBe(true);
        pressContinue();
        expect(duplicateWorkspace).not.toHaveBeenCalled();
        fireEvent.press(screen.getByRole('checkbox', {checked: false}));
        await waitForBatchedUpdates();
        expect(mockSelectionListProps?.confirmButtonOptions.isDisabled).toBe(false);
        pressContinue();
        expect(jest.mocked(duplicateWorkspace).mock.calls.at(0)?.[1].hasAcceptedTravelTerms).toBe(true);
    });
});
