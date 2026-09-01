import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import BetaOverridesPage from '@pages/settings/Troubleshoot/BetaOverridesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockIsProduction = false;
jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({isProduction: mockIsProduction}),
}));

const mockSetBetaOverride = jest.fn<void, [string, boolean]>();
const mockClearBetaOverrides = jest.fn<void, []>();
jest.mock('@userActions/User', () => ({
    setBetaOverride: (beta: string, value: boolean): void => {
        mockSetBetaOverride(beta, value);
    },
    clearBetaOverrides: (): void => {
        mockClearBetaOverrides();
    },
}));

const Stack = createPlatformStackNavigator<Record<string, undefined>>();

function renderBetaOverridesPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.RIGHT_MODAL.BETA_OVERRIDES}>
                        <Stack.Screen
                            name={SCREENS.RIGHT_MODAL.BETA_OVERRIDES}
                            component={BetaOverridesPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('BetaOverridesPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        mockSetBetaOverride.mockClear();
        mockClearBetaOverrides.mockClear();
    });

    it('renders a switch for every beta except the "all" beta', async () => {
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getAllByRole(CONST.ROLE.SWITCH).length).toBe(Object.values(CONST.BETAS).length - 1);
        expect(screen.queryByLabelText(CONST.BETAS.ALL)).toBeNull();
    });

    it('pins the opposite value when a beta that is off is toggled', async () => {
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, true));
    });

    it('pins false when a beta that is on is toggled', async () => {
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS]);
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, false));
    });

    it('marks only the betas that have an override stored', async () => {
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: false});
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getAllByText('Overridden').length).toBe(1);
    });

    it('clears every override when reset is pressed', async () => {
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: true});
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText('Reset all overrides'));

        expect(mockClearBetaOverrides).toHaveBeenCalled();
    });

    it('shows the not found page in production, since the route can still be reached by a deep link', async () => {
        mockIsProduction = true;
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryAllByRole(CONST.ROLE.SWITCH).length).toBe(0);
        expect(screen.queryByText('Reset all overrides')).toBeNull();
    });
});
