import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {toIndexMap} from '@libs/RuleUtils';

import EditMerchantRulePage from '@pages/workspace/rules/MerchantRules/EditMerchantRulePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Rule} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
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

const {FIELD} = CONST.RULES.EXPENSE_DEFAULT;
const {TRIGGERS: TRIGGER, ACTIONS: ACTION} = CONST.RULES;

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

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

/** Stops `GetRules` from actually going out, so a test can hold the collection in whatever fetch state it needs. */
function stubRulesFetch() {
    return jest.spyOn(API, 'read').mockImplementation(() => {});
}

async function seedOnyx(rule?: Rule) {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        if (rule) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.RULE}${RULE_ID}`, rule);
        }
        await waitForBatchedUpdatesWithAct();
    });
}

/** The page reads its params off the navigator, and `usePressLoading` needs a real navigation context. */
function renderEditMerchantRulePage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RULES_MERCHANT_EDIT}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.RULES_MERCHANT_EDIT}
                            component={EditMerchantRulePage}
                            initialParams={{policyID: POLICY_ID, ruleID: RULE_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

/**
 * The rules collection is shared across workspaces and rule kinds, so a ruleID reached by a bookmark, a
 * deeplink or browser history can point at something this editor must not write to. Saving replaces that
 * ruleID with a freshly built merchant rule, so the page has to refuse rather than render an empty form.
 */
describe('EditMerchantRulePage route guard', () => {
    let readSpy: ReturnType<typeof stubRulesFetch>;

    beforeEach(() => {
        // Every test mounts the editor, which sends `GetRules`. A real one resolves against the global fetch mock and
        // can land after the next test has cleared Onyx, marking the collection as fetched before that test mounts.
        readSpy = stubRulesFetch();
    });

    afterEach(async () => {
        // The editor is still mounted here because the testing library unmounts in an outer `afterEach`. Clearing the
        // fetch flags makes it send `GetRules` again, so the spy has to stay in place until the clear is done.
        await act(async () => {
            await Onyx.clear();
        });
        readSpy.mockRestore();
    });

    it('opens the editor for a rule this policy can edit', async () => {
        await seedOnyx(buildEditableRule());
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('EditMerchantRulePage')).toBeOnTheScreen();
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
            triggers: toIndexMap([CONST.RULES.TRIGGERS.REPORT_SUBMIT]),
            actions: toIndexMap([{name: CONST.RULES.ACTIONS.FORWARD_TO, approver: 'approver@example.com'}]),
        });
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('EditMerchantRulePage')).toBeNull();
    });

    it('fetches the rules collection when it is reached without one loaded', async () => {
        // Given this route is deep linkable, so nothing on the way in has populated the rules collection
        await seedOnyx();

        // When the editor mounts against an empty collection
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        // Then it requests the rules rather than settling on not-found for a rule that does exist server side. The
        // request only goes out once the fetch flags have loaded from Onyx, which can take more than one tick.
        await waitFor(() => expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.GET_RULES, expect.anything(), expect.anything()));
    });

    it('waits for the fetch instead of showing not-found or an empty form before the collection arrives', async () => {
        // Given the request is in flight, so Onyx has hydrated the collection as empty but nothing has answered yet
        await seedOnyx();
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_LOADING_RULES, true);
        });

        // When the editor mounts
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        // Then it holds on a loader, because an empty collection here means "not loaded", not "no such rule", and a
        // form filled in now would save over the rule the link points at
        expect(screen.getByTestId('EditMerchantRulePageLoading')).toBeOnTheScreen();
        expect(screen.queryByTestId('EditMerchantRulePage')).toBeNull();
    });

    it('refuses a ruleID that is absent once the collection has been fetched', async () => {
        // Given the fetch has answered and the rule is genuinely not in the collection
        await seedOnyx();
        await act(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_LOADING_RULES, false);
            await Onyx.set(ONYXKEYS.RAM_ONLY_HAS_RULES_DATA_BEEN_FETCHED, true);
        });

        // When the editor mounts
        renderEditMerchantRulePage();
        await waitForBatchedUpdatesWithAct();

        // Then the guard fires, since waiting any longer would never produce the rule
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
