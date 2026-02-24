/* eslint-disable @typescript-eslint/naming-convention */
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceUpgradePage from '@pages/workspace/upgrade/WorkspaceUpgradePage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.UPGRADE, initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.UPGRADE]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRouteName}>
                    <Stack.Screen
                        name={SCREENS.WORKSPACE.UPGRADE}
                        component={WorkspaceUpgradePage}
                        initialParams={initialParams}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
};

describe('WorkspaceUpgrade', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await waitForIdle();
        await act(async () => {
            await Onyx.clear();
        });

        jest.clearAllMocks();
    });

    it('should enable policy rules', async () => {
        const policy: Policy = LHNTestUtils.getFakePolicy();

        // Given that a policy is initialized in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // And WorkspaceUpgradePage for rules is opened
        const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id, featureName: 'rules'});

        // When the policy is upgraded by clicking on the Upgrade button
        fireEvent.press(screen.getByTestId('upgrade-button'));
        await waitForBatchedUpdatesWithAct();

        // Then "Upgrade to Corporate" API request should be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPGRADE_TO_CORPORATE, 1);

        // When WorkspaceUpgradePage is unmounted
        unmount();
        await waitForBatchedUpdates();

        // Then "Set policy rules enabled" API request should be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SET_POLICY_RULES_ENABLED, 1);
    });

    it("should show the upgrade corporate plan price is in the user's local currency", async () => {
        // Team policy which the user can upgrade to corporate
        const policy = LHNTestUtils.getFakePolicy();

        // Given that a policy is initialized in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // Render the WorkspaceUpgradePage without initializing user's preferred currency
        renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        // Expect the price to be in USD, as the user's preferred currency is not initialized
        const expectedPrice = convertToShortDisplayString(
            CONST.SUBSCRIPTION_PRICES[CONST.PAYMENT_CARD_CURRENCY.USD][CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            CONST.PAYMENT_CARD_CURRENCY.USD,
        );
        expect(await screen.findByText(expectedPrice, {exact: false})).toBeTruthy();

        // Iterate through all payment card currencies
        for (const currency of Object.values(CONST.PAYMENT_CARD_CURRENCY)) {
            // Format the price in the user's preferred currency
            const price = convertToShortDisplayString(CONST.SUBSCRIPTION_PRICES[currency][CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL], currency);

            // Initialized the user's preferred currency to another payment card currency
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CONST.DEFAULT_NUMBER_ID]: {localCurrencyCode: currency}});
            });

            // Render the WorkspaceUpgradePage without a feature to render GenericFeaturesView
            renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            expect(await screen.findByText(price, {exact: false})).toBeTruthy();

            // Render the WorkspaceUpgradePage with rules as a feature to render UpgradeIntro
            const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id, featureName: 'rules'});
            await waitForBatchedUpdatesWithAct();

            expect(await screen.findByText(price, {exact: false})).toBeTruthy();

            unmount();
        }

        await waitForBatchedUpdates();
    });
});
