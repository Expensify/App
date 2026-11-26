import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddHasToMatchPage from '@pages/workspace/rules/MerchantRules/AddHasToMatchPage';

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
import {setPersonalDetailsList} from '../utils/PersonalDetailsTestUtils';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy1';
const RULE_ID = 'merchantRule1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;

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

async function seedOnyx(hasToMatch: string[]) {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await setPersonalDetailsList({[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {hasToMatch});
        await waitForBatchedUpdatesWithAct();
    });
}

/** The page reads its params off the navigator, so it needs a real navigation context. */
function renderAddHasToMatchPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RULES_HAS_TO_MATCH}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.RULES_HAS_TO_MATCH}
                            component={AddHasToMatchPage}
                            initialParams={{policyID: POLICY_ID, ruleID: RULE_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('AddHasToMatchPage', () => {
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('lists a saved part the picker has no row of its own for', async () => {
        // Given a rule matching on a part this editor cannot create, which only a rule written elsewhere carries
        await seedOnyx([CONST.SEARCH.HAS_VALUES.LINK]);
        renderAddHasToMatchPage();
        await waitForBatchedUpdatesWithAct();

        // When the picker opens
        // Then the saved part is listed alongside the ones the editor offers, rather than selected out of sight
        expect(screen.getByText('Link')).toBeOnTheScreen();
        expect(screen.getByText('Receipt')).toBeOnTheScreen();
    });

    it('removes a saved part the picker has no row of its own for', async () => {
        // Given the same rule, whose condition an admin has no other way to drop short of deleting the rule
        await seedOnyx([CONST.SEARCH.HAS_VALUES.LINK, CONST.SEARCH.HAS_VALUES.RECEIPT]);
        renderAddHasToMatchPage();
        await waitForBatchedUpdatesWithAct();

        // When the admin clears it and saves
        fireEvent.press(screen.getByText('Link'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then only the parts still selected are written back to the draft
        expect(await getOnyxValue(ONYXKEYS.FORMS.MERCHANT_RULE_FORM)).toEqual(expect.objectContaining({hasToMatch: [CONST.SEARCH.HAS_VALUES.RECEIPT]}));
    });
});
