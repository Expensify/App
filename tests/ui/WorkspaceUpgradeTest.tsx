import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {WRITE_COMMANDS} from '@libs/API/types';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {waitForIdle} from '@libs/Network/SequentialQueue';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceUpgradePage from '@pages/workspace/upgrade/WorkspaceUpgradePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type React from 'react';
import type ReactNative from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

jest.mock('@hooks/usePolicyData', () =>
    jest.fn(() => ({
        policy: {},
        tags: {},
        categories: {},
        reports: [],
        transactionsAndViolations: {},
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn((illustrations: string[]) => Object.fromEntries(illustrations.map((name) => [name, 1]))),
    useMemoizedLazyExpensifyIcons: jest.fn((icons: string[]) => Object.fromEntries(icons.map((name) => [name, 1]))),
    useMemoizedLazyAsset: jest.fn(() => ({asset: 1})),
}));

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
        cleanup();
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

    it('should upgrade a Submit workspace to Corporate when unlocking a Control-tier rules feature', async () => {
        const policy: Policy = {...LHNTestUtils.getFakePolicy(), type: CONST.POLICY.TYPE.SUBMIT};

        // Given a Submit workspace
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // And the upgrade page is opened for the Control-tier "Prevent self-approvals" rule
        const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {
            policyID: policy.id,
            featureName: CONST.UPGRADE_FEATURE_INTRO_MAPPING.preventSelfApproval.alias,
        });

        // When the workspace is upgraded by clicking on the Upgrade button
        fireEvent.press(screen.getByTestId('upgrade-button'));
        await waitForBatchedUpdatesWithAct();

        // Then UpgradeSubmit should target the Corporate (Control) plan, since the rule requires Control
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.UPGRADE_SUBMIT, 0, {policyID: policy.id, targetType: CONST.POLICY.TYPE.CORPORATE});

        unmount();
        await waitForBatchedUpdates();
    });

    it('should show Collect pricing and upgrade a Submit workspace when unlocking a Collect-tier feature', async () => {
        const policy: Policy = {...LHNTestUtils.getFakePolicy(), type: CONST.POLICY.TYPE.SUBMIT};

        // Given a Submit workspace
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // And the upgrade page is opened for the Collect-tier Travel feature
        const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {
            policyID: policy.id,
            featureName: CONST.UPGRADE_FEATURE_INTRO_MAPPING.travelSubmit.alias,
        });

        // Then the Team (Collect) annual price is shown
        const teamPrice = convertToShortDisplayString(
            CONST.SUBSCRIPTION_PRICES[CONST.PAYMENT_CARD_CURRENCY.USD][CONST.POLICY.TYPE.TEAM][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            CONST.PAYMENT_CARD_CURRENCY.USD,
        );
        expect(await screen.findByText(teamPrice, {exact: false})).toBeTruthy();

        // When the workspace is upgraded by clicking on the Upgrade button
        fireEvent.press(screen.getByTestId('upgrade-button'));
        await waitForBatchedUpdatesWithAct();

        // Then UpgradeSubmit should target the Team (Collect) plan
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.UPGRADE_SUBMIT, 0, {policyID: policy.id, targetType: CONST.POLICY.TYPE.TEAM});

        unmount();
        await waitForBatchedUpdates();
    });

    it('should render the Collect plan title and Team pricing when upgradePlanType is team', async () => {
        const policy: Policy = LHNTestUtils.getFakePolicy();

        // Given that a policy is initialized in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // When the upgrade page is opened with upgradePlanType set to the Collect (Team) plan
        const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id, upgradePlanType: CONST.POLICY.TYPE.TEAM});
        await waitForBatchedUpdatesWithAct();

        // Then the Collect title is shown
        expect(await screen.findByText(TestHelper.translateLocal('workspace.upgrade.commonFeatures.collect.title'))).toBeTruthy();

        // And the Team (Collect) annual price is shown
        const teamPrice = convertToShortDisplayString(
            CONST.SUBSCRIPTION_PRICES[CONST.PAYMENT_CARD_CURRENCY.USD][CONST.POLICY.TYPE.TEAM][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            CONST.PAYMENT_CARD_CURRENCY.USD,
        );
        expect(await screen.findByText(teamPrice, {exact: false})).toBeTruthy();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should render the Control plan title and Corporate pricing when upgradePlanType is corporate', async () => {
        const policy: Policy = LHNTestUtils.getFakePolicy();

        // Given that a policy is initialized in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // When the upgrade page is opened with upgradePlanType set to the Control (Corporate) plan
        const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id, upgradePlanType: CONST.POLICY.TYPE.CORPORATE});
        await waitForBatchedUpdatesWithAct();

        // Then the Control title is shown
        expect(await screen.findByText(TestHelper.translateLocal('workspace.upgrade.commonFeatures.title'))).toBeTruthy();

        // And the Corporate (Control) annual price is shown
        const corporatePrice = convertToShortDisplayString(
            CONST.SUBSCRIPTION_PRICES[CONST.PAYMENT_CARD_CURRENCY.USD][CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            CONST.PAYMENT_CARD_CURRENCY.USD,
        );
        expect(await screen.findByText(corporatePrice, {exact: false})).toBeTruthy();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([ROUTES.WORKSPACE_COMPANY_CARDS.getRoute('1'), ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute('1')])(
        'should resume the add-card flow nested under %s after acknowledging the company cards upgrade',
        async (backTo) => {
            // Given an already-upgraded (Corporate) policy so the confirmation screen is shown
            const policy: Policy = {...LHNTestUtils.getFakePolicy('1'), type: CONST.POLICY.TYPE.CORPORATE};
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            });

            const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

            // And the company cards upgrade page is opened with an add-card entry page as backTo
            const {unmount} = renderPage(SCREENS.WORKSPACE.UPGRADE, {
                policyID: policy.id,
                featureName: CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias,
                backTo,
            });
            await waitForBatchedUpdatesWithAct();

            // Locate the confirmation button before asserting so its async lookup can't interleave with the press.
            const gotItButton = await screen.findByText(TestHelper.translateLocal('workspace.upgrade.completed.gotIt'));

            // Ignore any navigation triggered during mount/setup. We only care about the effect of the tap itself.
            navigateSpy.mockClear();
            goBackSpy.mockClear();

            // When the user acknowledges the upgrade by tapping "Got it, thanks"
            fireEvent.press(gotItButton);

            // Then it synchronously replaces the upgrade route with the add-card flow nested under backTo, and does not leave via goBack.
            // Assert right after the (synchronous) press, without awaiting, so unrelated async navigation can't land in the spies.
            expect(navigateSpy).toHaveBeenCalledWith(`${backTo}/${DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path}`, {forceReplace: true});
            expect(goBackSpy).not.toHaveBeenCalled();

            goBackSpy.mockRestore();
            navigateSpy.mockRestore();
            unmount();
            await waitForBatchedUpdatesWithAct();
        },
    );

    it("should show the upgrade corporate plan price is in the user's local currency", async () => {
        // Team policy which the user can upgrade to corporate
        const policy = LHNTestUtils.getFakePolicy();

        // Given that a policy is initialized in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });

        // Render the WorkspaceUpgradePage without initializing user's preferred currency
        const {unmount: unmountDefaultCurrencyView} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        // Expect the price to be in USD, as the user's preferred currency is not initialized
        const expectedPrice = convertToShortDisplayString(
            CONST.SUBSCRIPTION_PRICES[CONST.PAYMENT_CARD_CURRENCY.USD][CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL],
            CONST.PAYMENT_CARD_CURRENCY.USD,
        );
        expect(await screen.findByText(expectedPrice, {exact: false})).toBeTruthy();
        unmountDefaultCurrencyView();
        await waitForBatchedUpdatesWithAct();

        // Iterate through all payment card currencies
        for (const currency of Object.values(CONST.PAYMENT_CARD_CURRENCY)) {
            // Format the price in the user's preferred currency
            const price = convertToShortDisplayString(CONST.SUBSCRIPTION_PRICES[currency][CONST.POLICY.TYPE.CORPORATE][CONST.SUBSCRIPTION.TYPE.ANNUAL], currency);

            // Initialized the user's preferred currency to another payment card currency
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CONST.DEFAULT_NUMBER_ID]: {localCurrencyCode: currency}});
            });

            // Render the WorkspaceUpgradePage without a feature to render GenericFeaturesView
            const {unmount: unmountGenericFeaturesView} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id});
            await waitForBatchedUpdatesWithAct();

            expect(await screen.findByText(price, {exact: false})).toBeTruthy();
            unmountGenericFeaturesView();
            await waitForBatchedUpdatesWithAct();

            // Render the WorkspaceUpgradePage with rules as a feature to render UpgradeIntro
            const {unmount: unmountUpgradeIntroView} = renderPage(SCREENS.WORKSPACE.UPGRADE, {policyID: policy.id, featureName: 'rules'});
            await waitForBatchedUpdatesWithAct();

            expect(await screen.findByText(price, {exact: false})).toBeTruthy();

            unmountUpgradeIntroView();
            await waitForBatchedUpdatesWithAct();
        }
    });
});
