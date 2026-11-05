import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddMerchantToMatchPage from '@pages/workspace/rules/MerchantRules/AddMerchantToMatchPage';

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
const SAVED_MERCHANT = 'Starbucks';

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

async function seedOnyx() {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {merchantToMatch: SAVED_MERCHANT});
        await waitForBatchedUpdatesWithAct();
    });
}

/** The page reads its params off the navigator, so it needs a real navigation context. */
function renderAddMerchantToMatchPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH}
                            component={AddMerchantToMatchPage}
                            initialParams={{policyID: POLICY_ID, ruleID: RULE_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function clearTheMerchantAndSave() {
    fireEvent.changeText(screen.getByDisplayValue(SAVED_MERCHANT), '');
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('Save'));
    await waitForBatchedUpdatesWithAct();
}

describe('AddMerchantToMatchPage', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('accepts an empty merchant', async () => {
        // Given a rule that already matches on a merchant, which can match on a category or a tag instead
        await seedOnyx();
        renderAddMerchantToMatchPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin clears the merchant and saves
        await clearTheMerchantAndSave();

        // Then the merchant is cleared on the draft, which is how one condition is swapped for another
        expect(screen.queryByText('This field is required')).toBeNull();
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_RULE_FORM)).toEqual(expect.objectContaining({merchantToMatch: ''}));
    });
});
