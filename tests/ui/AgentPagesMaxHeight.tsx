import {act, render, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useIsInLandscapeModeModule from '@hooks/useIsInLandscapeMode';

import * as Browser from '@libs/Browser';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import EditPromptPage from '@pages/settings/Agents/Fields/EditPromptPage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const Stack = createStackNavigator<SettingsNavigatorParamList>();
const isInLandscapeMode = jest.spyOn(useIsInLandscapeModeModule, 'default');
const isMobile = jest.spyOn(Browser, 'isMobile');

function renderAddAgentPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.AGENTS.ADD}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.AGENTS.ADD}
                        component={AddAgentPage}
                        initialParams={{}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

function renderEditPromptPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.AGENTS.EDIT_PROMPT}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.AGENTS.EDIT_PROMPT}
                        component={EditPromptPage}
                        initialParams={{accountID: 1}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

describe('Agent builder pages keyboard max-height', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // Default to portrait: the regression these tests guard against was that portrait left
        // shouldEnableMaxHeight false, so the keyboard could cover the Custom instructions field.
        isInLandscapeMode.mockReturnValue(false);
        isMobile.mockReturnValue(false);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('AddAgentPage enables max-height in portrait so the keyboard cannot cover the instructions field', async () => {
        const renderResult = renderAddAgentPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            const screenWrapper = renderResult.UNSAFE_getAllByType(ScreenWrapper).at(0);
            expect(screenWrapper?.props.shouldEnableMaxHeight).toBe(true);
        });
    });

    it('AddAgentPage keeps max-height enabled in landscape', async () => {
        isInLandscapeMode.mockReturnValue(true);
        const renderResult = renderAddAgentPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            const screenWrapper = renderResult.UNSAFE_getAllByType(ScreenWrapper).at(0);
            expect(screenWrapper?.props.shouldEnableMaxHeight).toBe(true);
        });
    });

    it('EditPromptPage enables max-height in portrait so the keyboard cannot cover the instructions field', async () => {
        const renderResult = renderEditPromptPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            const screenWrapper = renderResult.UNSAFE_getAllByType(ScreenWrapper).at(0);
            expect(screenWrapper?.props.shouldEnableMaxHeight).toBe(true);
        });
    });

    it('EditPromptPage keeps max-height enabled in landscape', async () => {
        isInLandscapeMode.mockReturnValue(true);
        const renderResult = renderEditPromptPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            const screenWrapper = renderResult.UNSAFE_getAllByType(ScreenWrapper).at(0);
            expect(screenWrapper?.props.shouldEnableMaxHeight).toBe(true);
        });
    });
});
