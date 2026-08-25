import {act, render, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useIsInLandscapeModeModule from '@hooks/useIsInLandscapeMode';

import * as Browser from '@libs/Browser';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AddAgentPage from '@pages/settings/Agents/AddAgentPage';
import EditPromptPage from '@pages/settings/Agents/Fields/EditPromptPage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import ADD_AGENT_FORM_INPUT_IDS from '@src/types/form/AddAgentForm';
import EDIT_AGENT_PROMPT_FORM_INPUT_IDS from '@src/types/form/EditAgentPromptForm';

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

/**
 * The keyboard-overlap fix is structural: the focused Custom instructions field stays above the keyboard because the
 * FormProvider renders its ScrollView (RN scrolls the focused input into the keyboard-reduced viewport) around a bounded
 * `autoGrowHeight` input — the same pattern as the reference RHP markdown pages (PrivateNotesEditPage/RoomDescriptionPage).
 *
 * The earlier attempt gated this on landscape and relied on `shouldEnableMaxHeight`, which is a near no-op on native, so
 * these assertions guard the real regression: a revert to `shouldUseScrollView={shouldUseScrollableLayout}` (false in
 * portrait) or to a `flex1`-fill input (no `autoGrowHeight`) would fail here.
 */
function getPromptInputWrapper(renderResult: ReturnType<typeof render>, inputID: string) {
    return renderResult.UNSAFE_getAllByType(InputWrapper).find((instance) => instance.props.inputID === inputID);
}

function expectScrollableBoundedForm(renderResult: ReturnType<typeof render>, inputID: string) {
    // The form must keep its ScrollView (never disabled) so keyboard avoidance can scroll the focused input into view.
    const formProvider = renderResult.UNSAFE_getAllByType(FormProvider).at(0);
    expect(formProvider?.props.shouldUseScrollView).not.toBe(false);

    // The instructions input must be a bounded autoGrowHeight field, not a flex1 full-height fill that can't be scrolled above the keyboard.
    const promptInput = getPromptInputWrapper(renderResult, inputID);
    expect(promptInput?.props.autoGrowHeight).toBe(true);
}

describe('Agent builder pages keep the instructions field above the keyboard', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // Default to portrait: the regression these tests guard against was that portrait disabled the ScrollView and
        // used a flex1 full-height input, so the keyboard could cover the Custom instructions field.
        isInLandscapeMode.mockReturnValue(false);
        isMobile.mockReturnValue(false);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('AddAgentPage uses a scrollable form with a bounded instructions input in portrait', async () => {
        const renderResult = renderAddAgentPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expectScrollableBoundedForm(renderResult, ADD_AGENT_FORM_INPUT_IDS.PROMPT));
    });

    it('AddAgentPage keeps the scrollable bounded layout in landscape', async () => {
        isInLandscapeMode.mockReturnValue(true);
        const renderResult = renderAddAgentPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expectScrollableBoundedForm(renderResult, ADD_AGENT_FORM_INPUT_IDS.PROMPT));
    });

    it('EditPromptPage uses a scrollable form with a bounded instructions input in portrait', async () => {
        const renderResult = renderEditPromptPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expectScrollableBoundedForm(renderResult, EDIT_AGENT_PROMPT_FORM_INPUT_IDS.PROMPT));
    });

    it('EditPromptPage keeps the scrollable bounded layout in landscape', async () => {
        isInLandscapeMode.mockReturnValue(true);
        const renderResult = renderEditPromptPage();

        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expectScrollableBoundedForm(renderResult, EDIT_AGENT_PROMPT_FORM_INPUT_IDS.PROMPT));
    });
});
