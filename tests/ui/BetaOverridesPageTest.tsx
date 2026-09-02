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

// The page also checks the compiled environment, read through a getter so it stays settable per test
let mockConfigEnvironment: string = CONST.ENVIRONMENT.DEV;
jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {
        ...jest.requireActual<{default: Record<string, unknown>}>('@src/CONFIG').default,
        get ENVIRONMENT() {
            return mockConfigEnvironment;
        },
    },
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

    afterEach(() => {
        mockIsProduction = false;
        mockConfigEnvironment = CONST.ENVIRONMENT.DEV;
    });

    it('renders a switch for every beta except the "all" beta', async () => {
        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then Every beta is listed except 'all'
        expect(screen.getAllByRole(CONST.ROLE.SWITCH).length).toBe(Object.values(CONST.BETAS).length - 1);
        expect(screen.queryByLabelText(CONST.BETAS.ALL)).toBeNull();
    });

    it('pins the opposite value when a beta that is off is toggled', async () => {
        // Given An account without the beta, so its switch starts off
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When The switch is toggled
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        // Then The opposite value is pinned, so the backend cannot change it back later in the session
        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, true));
    });

    it('pins false when a beta that is on is toggled', async () => {
        // Given An account with the beta, so its switch starts on
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS]);
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When The switch is toggled
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        // Then False is pinned rather than the override being dropped, so toggling back is still an explicit choice
        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, false));
    });

    it('marks only the betas that have an override stored', async () => {
        // Given A single beta with an override stored
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: false});

        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then Only that beta is badged, so a pinned beta is distinguishable from one following the backend
        expect(screen.getAllByText('Overridden').length).toBe(1);
    });

    it('clears every override when reset is pressed', async () => {
        // Given A stored override
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: true});
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When Reset is pressed
        fireEvent.press(screen.getByText('Reset all overrides'));

        // Then Every override is cleared, so each beta follows the backend again
        expect(mockClearBetaOverrides).toHaveBeenCalled();
    });

    it('shows the not found page in production, since the route can still be reached by a deep link', async () => {
        // Given A production build, where overrides are ignored anyway
        mockIsProduction = true;
        mockConfigEnvironment = CONST.ENVIRONMENT.PRODUCTION;

        // When The page is opened, which a deep link still allows even though the row is hidden
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then The not found page is shown, so nobody can pin values that would never apply
        expect(screen.queryAllByRole(CONST.ROLE.SWITCH).length).toBe(0);
        expect(screen.queryByText('Reset all overrides')).toBeNull();
    });

    it('renders outside production even before the environment context resolves', async () => {
        // Given A staging build whose environment context has not resolved, so it still reports production
        mockIsProduction = true;
        mockConfigEnvironment = CONST.ENVIRONMENT.STAGING;

        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then The betas are listed rather than the not found page, so the page does not flash on open
        expect(screen.getAllByRole(CONST.ROLE.SWITCH).length).toBe(Object.values(CONST.BETAS).length - 1);
    });
});
