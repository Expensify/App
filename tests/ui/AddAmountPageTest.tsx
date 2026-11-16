import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAmountPage from '@pages/workspace/rules/MerchantRules/AddAmountPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy1';
const RULE_ID = 'merchantRule1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;

/** The draft opens on $30.00, which is what the input displays before the admin edits it. */
const SAVED_AMOUNT_IN_CENTS = '3000';
const DISPLAYED_AMOUNT = '30.00';

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function buildRulesEnabledControlPolicy(): Policy {
    return {
        ...createRandomPolicy(0),
        id: POLICY_ID,
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        areRulesEnabled: true,
        outputCurrency: CONST.CURRENCY.USD,
        pendingAction: undefined,
    };
}

async function seedOnyx() {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {merchantToMatch: 'Starbucks', amount: SAVED_AMOUNT_IN_CENTS});
        await waitForBatchedUpdatesWithAct();
    });
}

/** The page reads its params off the navigator, so it needs a real navigation context. */
function renderAddAmountPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RULES_MERCHANT_AMOUNT}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.RULES_MERCHANT_AMOUNT}
                            component={AddAmountPage}
                            initialParams={{policyID: POLICY_ID, ruleID: RULE_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function typeAmountAndSave(amount: string) {
    fireEvent.changeText(screen.getByDisplayValue(DISPLAYED_AMOUNT), amount);
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('Save'));
    await waitForBatchedUpdatesWithAct();
}

describe('AddAmountPage', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('saves an amount of zero', async () => {
        // Given a rule whose amount default is $30.00
        await seedOnyx();
        renderAddAmountPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin types zero and saves
        await typeAmountAndSave('0');

        // Then zero is kept, because zeroing an expense out is a default like any other
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_RULE_FORM)).toEqual(expect.objectContaining({amount: '0'}));
    });

    it('clears the default when the input is emptied', async () => {
        // Given the same rule
        await seedOnyx();
        renderAddAmountPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin clears the input and saves
        await typeAmountAndSave('');

        // Then the rule sets no amount at all, which is not the same as setting it to zero
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_RULE_FORM)).toEqual(expect.objectContaining({amount: ''}));
    });
});
