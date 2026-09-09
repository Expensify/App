import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import EditMerchantRulePage from '@pages/workspace/rules/MerchantRules/EditMerchantRulePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Rule} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy1';
const OTHER_POLICY_ID = 'policy2';
const RULE_ID = 'merchantRule1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;

const {FIELD, TRIGGER, ACTION} = CONST.RULES.EXPENSE_DEFAULT;

/** Mirrors the way the rules engine keys `triggers` and `actions` by a stringified index. */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

function buildRulesEnabledControlPolicy(): Policy {
    return {
        ...createRandomPolicy(0),
        id: POLICY_ID,
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        areRulesEnabled: true,
        pendingAction: undefined,
    };
}

function buildEditableRule(): Rule {
    return {
        scope: CONST.RULES.SCOPE.POLICY,
        scopeID: POLICY_ID,
        triggers: toIndexMap([TRIGGER.CREATE_TRANSACTION]),
        filters: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, right: 'Starbucks'},
        actions: toIndexMap([{name: ACTION.SET, field: FIELD.CATEGORY, value: 'Coffee'}]),
    };
}

async function seedOnyx(rule: Rule) {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}${RULE_ID}`, rule);
        await waitForBatchedUpdatesWithAct();
    });
}

function renderEditMerchantRulePage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <EditMerchantRulePage
                // @ts-expect-error - route type from navigator
                route={{key: 'test-route', name: 'Rules_Merchant_Edit', params: {policyID: POLICY_ID, ruleID: RULE_ID}}}
            />
        </ComposeProviders>,
    );
}

/**
 * The rules collection is shared across workspaces and rule kinds, so a ruleID reached by a bookmark, a
 * deeplink or browser history can point at something this editor must not write to. Saving replaces that
 * ruleID with a freshly built merchant rule, so the page has to refuse rather than render an empty form.
 */
describe('EditMerchantRulePage route guard', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('opens the editor for a rule this policy can edit', async () => {
        await seedOnyx(buildEditableRule());
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('EditMerchantRulePage')).not.toBeNull();
    });

    it('refuses a rule scoped to another policy', async () => {
        await seedOnyx({...buildEditableRule(), scopeID: OTHER_POLICY_ID});
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('EditMerchantRulePage')).toBeNull();
    });

    it('refuses an approval workflow rule that shares the ruleID', async () => {
        await seedOnyx({
            ...buildEditableRule(),
            triggers: toIndexMap([CONST.RULES.APPROVAL_WORKFLOW.TRIGGER.REPORT_SUBMIT]),
            actions: toIndexMap([{name: CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO, approver: 'approver@example.com'}]),
        });
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('EditMerchantRulePage')).toBeNull();
    });

    it('refuses a nested filter tree the form cannot represent', async () => {
        await seedOnyx({
            ...buildEditableRule(),
            filters: {
                left: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, right: 'Starbucks'},
                operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
                right: {left: FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, right: 'Costa'},
            },
        });
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('EditMerchantRulePage')).toBeNull();
    });
});
