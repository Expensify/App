import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import PolicyDistanceRateNameEditPage from '@pages/workspace/distanceRates/PolicyDistanceRateNameEditPage';

import {updatePolicyDistanceRateName} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Policy/DistanceRate', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test-only module mock. jest.requireActual returns an untyped module
    const actual = jest.requireActual('@userActions/Policy/DistanceRate');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- test-only module mock. Spreads the real actions and replaces only updatePolicyDistanceRateName
    return {
        ...actual,
        updatePolicyDistanceRateName: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const mockUpdatePolicyDistanceRateName = jest.mocked(updatePolicyDistanceRateName);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const CUSTOM_UNIT_ID = 'unit-1';
const GOVERNMENT_ATTRIBUTES = {governmentRate: {sourceRateID: 'GB_2026-09-01', rate: 14, startDate: '2026-09-01'}};

const RATES: Record<string, Rate> = {
    cars: {customUnitRateID: 'cars', name: 'Cars - From 9/1/26', rate: 1400, currency: CONST.CURRENCY.USD, enabled: true, startDate: '2026-09-01', attributes: GOVERNMENT_ATTRIBUTES},
    bikes: {customUnitRateID: 'bikes', name: 'Bikes - From 9/1/26', rate: 1400, currency: CONST.CURRENCY.USD, enabled: true, startDate: '2026-09-01', attributes: GOVERNMENT_ATTRIBUTES},
    summer: {customUnitRateID: 'summer', name: 'Summer - 6/1/26 - 8/31/26', rate: 1000, currency: CONST.CURRENCY.USD, enabled: true, startDate: '2026-06-01', endDate: '2026-08-31'},
};

const renderPage = (policyID: string, rateID: string) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT}
                                component={PolicyDistanceRateNameEditPage}
                                initialParams={{policyID, rateID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

/** The page wrapper needs an admin on a paid workspace with distance rates on. */
const setupPolicy = async () => {
    await TestHelper.signInWithTestUser();
    const policy: Policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        areDistanceRatesEnabled: true,
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                enabled: true,
                rates: RATES,
            },
        },
    };
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
    });
    return policy;
};

/** The header title shares the "Name" label, so pick the element that holds the input value. */
const getNameInput = () => {
    const input = screen.getAllByLabelText(TestHelper.translateLocal('common.name')).find((element) => typeof element.props.value === 'string');
    if (!input) {
        throw new Error('Expected the name input');
    }
    return input;
};

/** Waits for the form to be interactive, i.e. past the access wrapper's loading state. */
const waitForForm = async () => {
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(getNameInput()).toBeOnTheScreen();
    });
};

const save = async () => {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.save')}));
    await waitForBatchedUpdatesWithAct();
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

describe('PolicyDistanceRateNameEditPage', () => {
    it('prefills the name without the date suffix and saves the new name with the suffix appended', async () => {
        // Given a government band whose name carries a date suffix the backend added for uniqueness
        const policy = await setupPolicy();
        const {unmount} = renderPage(policy.id, 'cars');
        await waitForForm();

        // Then the input starts from the name without the suffix, matching the name shown everywhere else
        expect(getNameInput().props.value).toBe('Cars');

        // When the user renames it to "Vans" and saves
        fireEvent.changeText(getNameInput(), 'Vans');
        await save();

        // Then the original suffix is appended back, so Onyx and the API still get the full raw name
        expect(mockUpdatePolicyDistanceRateName).toHaveBeenCalledWith(policy.id, expect.objectContaining({customUnitID: CUSTOM_UNIT_ID}), [
            expect.objectContaining({customUnitRateID: 'cars', name: 'Vans - From 9/1/26'}),
        ]);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('rejects a name that duplicates another rate once the suffix is appended', async () => {
        // Given a government band and another band whose full name is "Bikes - From 9/1/26"
        const policy = await setupPolicy();
        const {unmount} = renderPage(policy.id, 'cars');
        await waitForForm();

        // When the user types "Bikes", which only collides once the hidden suffix is added back
        fireEvent.changeText(getNameInput(), 'Bikes');
        await save();

        // Then the duplicate check runs against the full name that would be saved, so the rename is blocked
        expect(screen.getByText(TestHelper.translateLocal('workspace.distanceRates.errors.existingRateName'))).toBeOnTheScreen();
        expect(mockUpdatePolicyDistanceRateName).not.toHaveBeenCalled();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('prefills and saves the full name of a custom dated rate', async () => {
        // Given a custom rate with dates that a user named with a date on purpose
        const policy = await setupPolicy();
        const {unmount} = renderPage(policy.id, 'summer');
        await waitForForm();

        // Then the input shows the full name, because only government rates hide the suffix
        expect(getNameInput().props.value).toBe('Summer - 6/1/26 - 8/31/26');

        // When the user renames it and saves
        fireEvent.changeText(getNameInput(), 'Winter');
        await save();

        // Then the typed name is saved as is, with nothing appended
        expect(mockUpdatePolicyDistanceRateName).toHaveBeenCalledWith(policy.id, expect.objectContaining({customUnitID: CUSTOM_UNIT_ID}), [
            expect.objectContaining({customUnitRateID: 'summer', name: 'Winter'}),
        ]);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
