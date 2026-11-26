/** Rule tag pickers must retain usable sibling options when an empty level omits its tags map. */
import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import PersonalAddTagPage from '@pages/settings/Rules/Fields/AddTagPage';
import WorkspaceAddTagPage from '@pages/workspace/rules/MerchantRules/AddTagPage';
import AddTagToMatchPage from '@pages/workspace/rules/MerchantRules/AddTagToMatchPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'ruleTagPickerPolicy';
const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();
const pickerScreens = [SCREENS.SETTINGS.RULES.EDIT_TAG, SCREENS.WORKSPACE.RULES_MERCHANT_TAG, SCREENS.WORKSPACE.RULES_TAG_TO_MATCH] as const;

describe('Rule tag pickers', () => {
    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${POLICY_ID}`, {hasOnceLoaded: true, isLoading: false});
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`,
                createMock<PolicyTagLists>({
                    Department: {
                        name: 'Department',
                        orderWeight: 0,
                        tags: {Sales: {name: 'Sales', enabled: true}, Disabled: {name: 'Disabled', enabled: false}},
                    },
                    Broken: {name: 'Broken', orderWeight: 99},
                }),
            );
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each(pickerScreens)('offers healthy sibling tags with missing tags on %s', async (initialRouteName) => {
        // Given a policy containing an enabled sibling and a list without a nested map.
        // When opening either rule tag picker or the matching-tag condition picker.
        const {unmount} = render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <PortalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={initialRouteName}>
                            <Stack.Screen
                                name={SCREENS.SETTINGS.RULES.EDIT_TAG}
                                component={PersonalAddTagPage}
                                initialParams={{index: 0}}
                            />
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.RULES_MERCHANT_TAG}
                                component={WorkspaceAddTagPage}
                                initialParams={{policyID: POLICY_ID, ruleID: 'new', orderWeight: 0}}
                            />
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.RULES_TAG_TO_MATCH}
                                component={AddTagToMatchPage}
                                initialParams={{policyID: POLICY_ID, ruleID: 'new'}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </PortalProvider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the missing map does not prevent selection of the healthy level's enabled tag.
        expect(screen.getByText('Sales')).toBeOnTheScreen();
        expect(screen.queryByText('Disabled')).not.toBeOnTheScreen();
        unmount();
    });
});
