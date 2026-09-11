import {fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';

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
const mockClearBetaOverride = jest.fn<void, [string]>();
const mockClearBetaOverrides = jest.fn<void, []>();
jest.mock('@userActions/User', () => ({
    setBetaOverride: (beta: string, value: boolean): void => {
        mockSetBetaOverride(beta, value);
    },
    clearBetaOverride: (beta: string): void => {
        mockClearBetaOverride(beta);
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
        mockClearBetaOverride.mockClear();
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

    it('stores an override when a beta that is off is toggled on', async () => {
        // Given An account without the beta, so its switch starts off
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When The switch is toggled
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        // Then The override is stored, since it now differs from the account
        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, true));
    });

    it('stores an override when a beta that is on is toggled off', async () => {
        // Given An account with the beta, so its switch starts on
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS]);
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When The switch is toggled
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        // Then The override is stored, since it now differs from the account
        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, false));
    });

    it('drops the override when a beta is toggled back to the value the account has', async () => {
        // Given An account without the beta and an override pinning it on
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: true});
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When The switch is toggled back
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        // Then The override is dropped rather than stored, so only betas that differ from the account keep one
        await waitFor(() => expect(mockClearBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS));
        expect(mockSetBetaOverride).not.toHaveBeenCalled();
    });

    it('stops badging an override the account has caught up with', async () => {
        // Given An override forcing a beta on that the account has since been granted
        await Onyx.multiSet({
            [ONYXKEYS.BETA_OVERRIDES]: {[CONST.BETAS.DEFAULT_ROOMS]: true},
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
        });

        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then Nothing is badged, since the stored value no longer differs from the account
        expect(screen.queryByText('Overridden')).toBeNull();
    });

    it('keeps badging a beta forced off while the account betas are unknown', async () => {
        // Given An override forcing a beta off before the account betas have loaded, which Onyx.clear does not preserve
        await Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: false});

        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then It stays badged, since unknown account betas must not be read as every beta being off
        expect(within(screen.getByTestId(`row-${CONST.BETAS.DEFAULT_ROOMS}`)).getByText('Overridden')).toBeOnTheScreen();
    });

    it('badges a beta forced off that the account grants', async () => {
        // Given An account with the beta and an override forcing it off
        await Onyx.multiSet({
            [ONYXKEYS.BETA_OVERRIDES]: {[CONST.BETAS.DEFAULT_ROOMS]: false},
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
        });

        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then It is badged and off, since a false override is load-bearing when the account grants the beta
        expect(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS, checked: false})).toBeOnTheScreen();
        expect(within(screen.getByTestId(`row-${CONST.BETAS.DEFAULT_ROOMS}`)).getByText('Overridden')).toBeOnTheScreen();
    });

    it('drops the override when a beta the account grants is toggled back on', async () => {
        // Given An account with the beta and an override forcing it off
        await Onyx.multiSet({
            [ONYXKEYS.BETA_OVERRIDES]: {[CONST.BETAS.DEFAULT_ROOMS]: false},
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
        });
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // When The switch is toggled back on
        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        // Then The override is dropped rather than rewritten to true
        await waitFor(() => expect(mockClearBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS));
        expect(mockSetBetaOverride).not.toHaveBeenCalled();
    });

    it('marks only the betas that differ from the account', async () => {
        // Given Two stored overrides, one the account has caught up with and one it has not
        await Onyx.multiSet({
            [ONYXKEYS.BETA_OVERRIDES]: {[CONST.BETAS.DEFAULT_ROOMS]: true, [CONST.BETAS.ASAP_SUBMIT]: true},
            [ONYXKEYS.BETAS]: [CONST.BETAS.ASAP_SUBMIT],
        });

        // When The page is opened
        renderBetaOverridesPage();
        await waitForBatchedUpdatesWithAct();

        // Then Only the differing beta is badged, so the badge tracks the account rather than the stored key
        expect(screen.getAllByText('Overridden').length).toBe(1);
        expect(screen.getByLabelText(CONST.BETAS.DEFAULT_ROOMS)).toBeOnTheScreen();
        expect(within(screen.getByTestId(`row-${CONST.BETAS.DEFAULT_ROOMS}`)).getByText('Overridden')).toBeOnTheScreen();
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
