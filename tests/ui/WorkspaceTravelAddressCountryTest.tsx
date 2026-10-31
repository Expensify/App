import {act, fireEvent, render, screen} from '@testing-library/react-native';

import * as AddressFormModule from '@components/AddressForm';
import ComposeProviders from '@components/ComposeProviders';
import * as FormWrapperModule from '@components/Form/FormWrapper';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceAddressStep from '@pages/Travel/EnableTravel/subPages/WorkspaceAddressStep';
import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {getRequiredWriteCall, signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({default: jest.fn(), MarkerView: jest.fn(), setAccessToken: jest.fn()}));

type TravelAddressWriteSpy = jest.SpyInstance<ReturnType<typeof API.write>, Parameters<typeof API.write>>;

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

/** Keeps the actual Travel step, form, selectors and navigation in the same rendered flow. */
function renderTravelAddress(policy: Policy, onNext: EnableTravelSubPageProps['onNext']) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.PROFILE.ADDRESS}>
                        <Stack.Screen name={SCREENS.SETTINGS.PROFILE.ADDRESS}>
                            {() => (
                                <WorkspaceAddressStep
                                    policy={policy}
                                    policyID={policy.id}
                                    onNext={onNext}
                                    onMove={() => {}}
                                    isEditing={false}
                                    resolvedDomain="company.com"
                                />
                            )}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('Workspace travel address country', () => {
    let writeSpy: TravelAddressWriteSpy;
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await IntlStore.load(CONST.LOCALES.EN);
        });
        await signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
        writeSpy = jest.spyOn(API, 'write');
    });

    afterEach(() => {
        writeSpy.mockRestore();
    });

    it('retains registered city and ZIP after a country switch and validates before submitting', async () => {
        // Given a real Travel form whose city and ZIP are already registered from a Canadian address.
        const policy = createMock<Policy>({
            id: 'travel-policy',
            address: {addressStreet: ' 123 Main St ', addressStreet2: ' Suite 4 ', country: 'CA', state: 'Ontario', city: 'Toronto', zipCode: 'M5V 2T6'},
        });
        const onNext = jest.fn();
        renderTravelAddress(policy, onNext);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Canada')).toBeDefined();
        writeSpy.mockClear().mockResolvedValue(undefined);
        const wrapperSpy = jest.spyOn(FormWrapperModule, 'default');
        try {
            // When real route selection changes the country, only the explicit country/state values track parent clears.
            await act(async () => {
                Navigation.setParams({country: 'VN'});
            });
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Vietnam')).toBeDefined();
            expect(screen.getByLabelText('State / Province').props.value).toBe('');
            expect(screen.getByLabelText('City').props.value).toBe('Toronto');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
            expect(navigationRef.getCurrentRoute()?.params).toEqual(expect.objectContaining({country: undefined}));
            // Control the real form's 1,000 ms submit debounce because setupAfterEnv uses real timers.
            jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
            fireEvent.press(screen.getByText('Next'));
            await waitForBatchedUpdatesWithAct();
            expect(writeSpy).not.toHaveBeenCalled();
            expect(onNext).not.toHaveBeenCalled();

            // The retained Canadian ZIP is invalid for VN. Actual edits must pass validation before a retry.
            fireEvent.changeText(screen.getByLabelText('State / Province'), ' Province ');
            await waitForBatchedUpdatesWithAct();
            fireEvent.changeText(screen.getByLabelText('Zip / Postcode'), '133836');
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                // Exhaust the existing leading submit debounce before the next press.
                jest.advanceTimersByTime(1000);
            });
            // Observe the real validator's errors before the retry, rather than assuming the edited form is valid.
            expect(wrapperSpy.mock.calls.at(-1)?.[0].errors).toEqual({});
            fireEvent.press(screen.getByText('Next'));
            await waitForBatchedUpdatesWithAct();

            // Then submission uses the retained registered city and edited finite country/state/ZIP.
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_POLICY_ADDRESS);
            expect(params).toEqual({
                policyID: policy.id,
                addressStreet: '123 Main St',
                addressStreet2: 'Suite 4',
                city: 'Toronto',
                state: 'Province',
                zipCode: '133836',
                country: 'VN',
            });
            expect(onNext).toHaveBeenCalledTimes(1);
            expect(writeSpy.mock.invocationCallOrder.at(0)).toBeLessThan(onNext.mock.invocationCallOrder.at(0) ?? 0);
        } finally {
            jest.useRealTimers();
            wrapperSpy.mockRestore();
            writeSpy.mockRestore();
        }
    });

    it('trims the real submitted address and converts a Canadian postal code to uppercase', async () => {
        // Given a complete Canadian office address with whitespace and a lowercase postal code.
        const policy = createMock<Policy>({
            id: 'travel-policy',
            address: {addressStreet: ' 123 Main St ', addressStreet2: ' Suite 4 ', country: 'CA', state: ' Ontario ', city: ' Toronto ', zipCode: ' m5v 2t6 '},
        });
        const onNext = jest.fn();
        renderTravelAddress(policy, onNext);
        await waitForBatchedUpdatesWithAct();
        writeSpy.mockClear().mockResolvedValue(undefined);
        try {
            // When the real form validates and submits the saved address.
            fireEvent.press(screen.getByText('Next'));
            await waitForBatchedUpdatesWithAct();

            // Then Travel retains its original trimming, ZIP uppercase and update-before-next behavior.
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_POLICY_ADDRESS);
            expect(params).toEqual({policyID: policy.id, addressStreet: '123 Main St', addressStreet2: 'Suite 4', city: 'Toronto', state: 'Ontario', zipCode: 'M5V 2T6', country: 'CA'});
            expect(onNext).toHaveBeenCalledTimes(1);
            expect(writeSpy.mock.invocationCallOrder.at(0)).toBeLessThan(onNext.mock.invocationCallOrder.at(0) ?? 0);
        } finally {
            writeSpy.mockRestore();
        }
    });

    it('registers actual state, city and ZIP edits without applying downstream default clears', async () => {
        // Given a real non-US form and a call-through observer that leaves registration intact.
        const policy = createMock<Policy>({id: 'travel-policy', address: {addressStreet: '123 Main St', country: 'CA', state: 'Ontario', city: 'Toronto', zipCode: 'M5V 2T6'}});
        const onNext = jest.fn();
        const formSpy = jest.spyOn(AddressFormModule, 'default');
        writeSpy.mockClear().mockResolvedValue(undefined);
        try {
            renderTravelAddress(policy, onNext);
            await waitForBatchedUpdatesWithAct();

            // When state changes, the parent clears defaults while the real registered city and ZIP retain.
            fireEvent.changeText(screen.getByLabelText('State / Province'), 'Quebec');
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: 'Quebec', city: '', zip: ''}));
            expect(screen.getByText('Canada')).toBeDefined();
            expect(screen.getByLabelText('City').props.value).toBe('Toronto');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
            fireEvent.changeText(screen.getByLabelText('City'), 'Montreal');
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByLabelText('City').props.value).toBe('Montreal');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
            fireEvent.changeText(screen.getByLabelText('Zip / Postcode'), 'H2Y 1C6');
            await waitForBatchedUpdatesWithAct();
            fireEvent.changeText(screen.getByLabelText('City'), 'Laval');
            await waitForBatchedUpdatesWithAct();

            // Then each edited key registers itself, even when the parent ZIP default is empty again.
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: 'Quebec', city: 'Laval', zip: ''}));
            expect(screen.getByLabelText('State / Province').props.value).toBe('Quebec');
            expect(screen.getByLabelText('City').props.value).toBe('Laval');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('H2Y 1C6');
            fireEvent.press(screen.getByText('Next'));
            await waitForBatchedUpdatesWithAct();
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_POLICY_ADDRESS);
            expect(params).toEqual(expect.objectContaining({country: 'CA', state: 'Quebec', city: 'Laval', zipCode: 'H2Y 1C6'}));
            expect(onNext).toHaveBeenCalledTimes(1);
        } finally {
            writeSpy.mockRestore();
            formSpy.mockRestore();
        }
    });

    it('observes local clears and same-country ZIP fallthrough through captured child callbacks', async () => {
        // Given a call-through AddressForm observer. These captures bypass user event production and cannot prove batched setter order.
        const formSpy = jest.spyOn(AddressFormModule, 'default');
        const policy = createMock<Policy>({id: 'travel-policy', address: {addressStreet: '123 Main St', country: 'CA', state: 'Ontario', city: 'Toronto', zipCode: 'M5V 2T6'}});
        try {
            renderTravelAddress(policy, () => {});
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: 'Ontario', city: 'Toronto', zip: 'M5V 2T6', addBottomSafeAreaPadding: false}));

            // When each captured callback is taken from the latest rendered props, its current-country closure stays current.
            await act(async () => {
                const props = formSpy.mock.calls.at(-1)?.[0];
                if (!props?.onAddressChanged) {
                    throw new Error('Expected the real Travel AddressForm change callback.');
                }
                props.onAddressChanged('CA', INPUT_IDS.COUNTRY);
            });
            await waitForBatchedUpdatesWithAct();

            // Then same-country fallthrough updates only the parent ZIP prop, not the registered ZIP.
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: 'Ontario', city: 'Toronto', zip: 'CA'}));
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
            await act(async () => {
                const props = formSpy.mock.calls.at(-1)?.[0];
                if (!props?.onAddressChanged) {
                    throw new Error('Expected the real Travel AddressForm change callback.');
                }
                props.onAddressChanged('ignored', {toString: () => 'unrecognized'});
            });
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: 'Ontario', city: 'Toronto', zip: 'CA'}));
            await act(async () => {
                const props = formSpy.mock.calls.at(-1)?.[0];
                if (!props?.onAddressChanged) {
                    throw new Error('Expected the real Travel AddressForm change callback.');
                }
                props.onAddressChanged(123, {toString: () => INPUT_IDS.STATE});
            });
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: '', city: '', zip: ''}));
            expect(screen.getByLabelText('State / Province').props.value).toBe('');
            expect(screen.getByLabelText('City').props.value).toBe('Toronto');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
            await act(async () => {
                const props = formSpy.mock.calls.at(-1)?.[0];
                if (!props?.onAddressChanged) {
                    throw new Error('Expected the real Travel AddressForm change callback.');
                }
                props.onAddressChanged('VN', INPUT_IDS.COUNTRY);
            });
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'VN', state: '', city: '', zip: ''}));
            expect(screen.getByText('Vietnam')).toBeDefined();
            expect(screen.getByLabelText('City').props.value).toBe('Toronto');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
        } finally {
            formSpy.mockRestore();
        }
    });
});
