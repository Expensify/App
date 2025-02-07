/* eslint-disable @typescript-eslint/naming-convention */
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import createResponsiveStackNavigator from '@navigation/AppNavigator/createResponsiveStackNavigator';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceUpgradePage from '@pages/workspace/upgrade/WorkspaceUpgradePage';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const RootStack = createResponsiveStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.UPGRADE, initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.UPGRADE]) => {
    return render(
        <NavigationContainer>
            <RootStack.Navigator initialRouteName={initialRouteName}>
                <RootStack.Screen
                    name={SCREENS.WORKSPACE.UPGRADE}
                    component={WorkspaceUpgradePage}
                    initialParams={initialParams}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
};

describe('WorkspaceUpgrade', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await SequentialQueue.waitForIdle();
        await act(async () => {
            await Onyx.clear();
        });

        jest.clearAllMocks();
    });

    it('should enable policy rules', async () => {
        const policy: Policy = LHNTestUtils.getFakePolicy();

        // Given that a policy is initialized in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

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
});
