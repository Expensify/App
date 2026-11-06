import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import * as AddressFormModule from '@components/AddressForm';
import ComposeProviders from '@components/ComposeProviders';
import * as FormWrapperModule from '@components/Form/FormWrapper';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {translate, translateCountry} from '@libs/Localize';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import PersonalAddressPage from '@pages/settings/Profile/PersonalDetails/PersonalAddressPage';

import Config from '@src/CONFIG';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {GestureResponderEvent} from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import {getRequiredWriteCall} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

type AddressWriteSpy = jest.SpyInstance<ReturnType<typeof API.write>, Parameters<typeof API.write>>;

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.SETTINGS.PROFILE.ADDRESS) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.ADDRESS}
                            component={PersonalAddressPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('AddressPageTest', () => {
    let writeSpy: AddressWriteSpy;
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });
    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
            await IntlStore.load(CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
        writeSpy = jest.spyOn(API, 'write');
    });

    afterEach(() => {
        writeSpy.mockRestore();
    });

    it('should not reset state', async () => {
        // Given a saved state and country that already match the returning selector route.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PRIVATE_PERSONAL_DETAILS}`, {
                addresses: [
                    {
                        state: 'Test',
                        country: 'VN',
                        street: 'Test',
                    },
                ],
            });
            await Onyx.merge(`${ONYXKEYS.IS_LOADING_APP}`, false);
        });

        await waitForBatchedUpdatesWithAct();

        // When the real page mounts from those saved values.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        const stateInput = screen.getByLabelText('State / Province');
        expect(stateInput.props.value).toEqual('Test');
        Navigation.setParams({
            country: 'VN',
        });
        await waitForBatchedUpdatesWithAct();
        // Then a same-country selection retains the existing state.
        const stateInputAfterParams = screen.getByLabelText('State / Province');
        expect(stateInputAfterParams.props.value).toEqual('Test');
    });

    it('should prefill address line 2 from explicit street2', async () => {
        // Given both an explicit second line and a legacy newline fallback.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PRIVATE_PERSONAL_DETAILS}`, {
                addresses: [
                    {
                        country: 'US',
                        street: '123 Main St\nLegacy Suite',
                        street2: 'Suite 500',
                    },
                ],
            });
            await Onyx.merge(`${ONYXKEYS.IS_LOADING_APP}`, false);
        });

        await waitForBatchedUpdatesWithAct();

        // When the real page reads the saved address.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        // Then the explicit second line takes precedence.
        expect(screen.getByDisplayValue('Suite 500')).toBeDefined();
    });

    it('should prefill address line 2 from legacy newline when street2 is missing', async () => {
        // Given an address that still stores the second line after a newline.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PRIVATE_PERSONAL_DETAILS}`, {
                addresses: [
                    {
                        country: 'US',
                        street: '123 Main St\nLegacy Suite',
                    },
                ],
            });
            await Onyx.merge(`${ONYXKEYS.IS_LOADING_APP}`, false);
        });

        await waitForBatchedUpdatesWithAct();

        // When the real page reads the saved address.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        // Then the historical second line remains visible.
        expect(screen.getByDisplayValue('Legacy Suite')).toBeDefined();
    });

    it('uses the current saved address before the last entry and the default country', async () => {
        // Given a current Canadian address before a later US entry and a Vietnamese IP default.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.COUNTRY, 'VN');
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                addresses: [
                    {street: 'Current street', country: 'CA', state: 'Ontario', current: true},
                    {street: 'Last street', country: 'US', state: 'NY'},
                ],
            });
        });

        // When the real personal-address page selects and normalizes the saved address.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
        await waitForBatchedUpdatesWithAct();

        // Then saved data takes precedence over both the last entry and the IP default.
        expect(screen.getByText('Canada')).toBeDefined();
        expect(screen.getByDisplayValue('Current street')).toBeDefined();
        expect(screen.getByLabelText('State / Province').props.value).toBe('Ontario');
    });

    it('normalizes a legacy saved country name in the real personal-address consumer', async () => {
        // Given the historical address representation accepted by the normalizer boundary.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                addresses: [
                    {
                        street: 'Legacy street',
                        // @ts-expect-error - This exact legacy country-name field predates the finite Address model.
                        country: 'Canada',
                        state: 'Ontario',
                    },
                ],
            });
        });

        // When the actual page loads the persisted legacy address.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
        await waitForBatchedUpdatesWithAct();

        // Then the original country-name normalization still supplies the selector label.
        expect(screen.getByText('Canada')).toBeDefined();
        expect(screen.getByLabelText('State / Province').props.value).toBe('Ontario');
    });

    it('preserves saved-empty precedence over a nonempty default', async () => {
        // Given an explicitly empty saved country rather than an absent saved address.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.COUNTRY, 'US');
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: 'Saved street', country: ''}]});
        });

        // When the page initializes from saved country ?? default.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
        await waitForBatchedUpdatesWithAct();

        // Then the empty value wins and retains the non-US state input.
        expect(screen.queryByText('United States')).toBeNull();
        expect(screen.getByLabelText('State / Province')).toBeDefined();
    });

    it('returns undefined with loading metadata while the real country merge is pending', async () => {
        // Given an uncached COUNTRY key with an actual pending Onyx merge.
        const mergePromise = Onyx.merge(ONYXKEYS.COUNTRY, 'CA');

        // When the production hook subscribes before that merge reaches the cache.
        const {result} = renderHook(() => useOnyx(ONYXKEYS.COUNTRY));

        // Then loading blanks the value until the same real merge completes.
        expect(result.current[1].status).toBe('loading');
        expect(result.current[0]).toBeUndefined();
        await act(async () => {
            await mergePromise;
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current[1].status).toBe('loaded');
        expect(result.current[0]).toBe('CA');
    });

    it('retains actual COUNTRY hook absence, raw strings and deletion-to-undefined', async () => {
        // Given the custom production hook without a COUNTRY selector or a snapshot-compatible key.
        const {result} = renderHook(() => useOnyx(ONYXKEYS.COUNTRY));
        await waitForBatchedUpdatesWithAct();
        expect(result.current[0]).toBeUndefined();
        expect(result.current[1].status).toBe('loaded');

        // When legitimate persisted strings and the Onyx deletion value reach the installed hook.
        for (const country of ['', 'US', 'United States', 'unknown-country']) {
            await act(async () => {
                await Onyx.set(ONYXKEYS.COUNTRY, country);
            });
            await waitForBatchedUpdatesWithAct();

            // Then the hook preserves all strings without finite-country coercion.
            expect(result.current[0]).toBe(country);
            expect(result.current[1].status).toBe('loaded');
        }
        await act(async () => {
            await Onyx.set(ONYXKEYS.COUNTRY, null);
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current[0]).toBeUndefined();
        expect(result.current[1].status).toBe('loaded');
    });

    it('keeps registered empty defaults when a saved address hydrates the mounted page', async () => {
        // Given no saved address and a Canadian default when the actual form first registers its empty fields.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.COUNTRY, 'CA');
        });
        const formSpy = jest.spyOn(AddressFormModule, 'default');
        writeSpy.mockClear().mockResolvedValue(undefined);
        try {
            renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Canada')).toBeDefined();

            // When only the IP default changes or is deleted, the mounted country is not reinitialized.
            await act(async () => {
                await Onyx.set(ONYXKEYS.COUNTRY, 'VN');
            });
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Canada')).toBeDefined();
            await act(async () => {
                await Onyx.set(ONYXKEYS.COUNTRY, null);
            });
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Canada')).toBeDefined();
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: 'Saved street', country: 'VN', state: 'Province', city: 'City', zip: '133836'}]});
            });
            await waitForBatchedUpdatesWithAct();

            // Then parent defaults change while already registered empty street/city/ZIP values retain.
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'VN', state: 'Province', street1: 'Saved street', city: 'City', zip: '133836'}));
            expect(screen.getByText('Vietnam')).toBeDefined();
            expect(screen.getByLabelText('State / Province').props.value).toBe('Province');
            expect(screen.getByLabelText('Address line 1').props.value).toBe('');
            expect(screen.getByLabelText('City').props.value).toBe('');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('');
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(writeSpy).not.toHaveBeenCalled();
        } finally {
            writeSpy.mockRestore();
            formSpy.mockRestore();
        }
    });

    it('initializes registered fields from an address already saved before a fresh mount', async () => {
        // Given the same valid saved address before any form input has registered.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: 'Saved street', country: 'VN', state: 'Province', city: 'City', zip: '133836'}]});
        });

        // When a new page registers its input defaults from that saved address.
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
        await waitForBatchedUpdatesWithAct();

        // Then defaults initialize missing registered values, separately from mounted hydration.
        expect(screen.getByDisplayValue('Saved street')).toBeDefined();
        expect(screen.getByText('Vietnam')).toBeDefined();
        expect(screen.getByLabelText('State / Province').props.value).toBe('Province');
        expect(screen.getByLabelText('City').props.value).toBe('City');
        expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('133836');
    });

    it('submits retained registered street and city after populated saved-address hydration', async () => {
        // Given populated defaults registered by a fresh Canadian address form.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                addresses: [{street: 'Old street', street2: 'Old suite', country: 'CA', state: 'Old state', city: 'Toronto', zip: 'M5V 2T6'}],
            });
        });
        const formSpy = jest.spyOn(AddressFormModule, 'default');
        writeSpy.mockClear().mockResolvedValue(undefined);
        const wrapperSpy = jest.spyOn(FormWrapperModule, 'default');
        try {
            renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
            await waitForBatchedUpdatesWithAct();

            // When new saved data hydrates parent props without remounting or resetting the actual form.
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                    addresses: [{street: 'New street', street2: 'New suite', country: 'VN', state: 'Province', city: 'New city', zip: '133836'}],
                });
            });
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(
                expect.objectContaining({country: 'VN', state: 'Province', street1: 'New street', street2: 'New suite', city: 'New city', zip: '133836'}),
            );
            expect(screen.getByText('Vietnam')).toBeDefined();
            expect(screen.getByLabelText('State / Province').props.value).toBe('Province');
            expect(screen.getByDisplayValue('Old street')).toBeDefined();
            expect(screen.getByDisplayValue('Old suite')).toBeDefined();
            expect(screen.getByLabelText('City').props.value).toBe('Toronto');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('M5V 2T6');
            // Control the real form's 1,000 ms submit debounce because setupAfterEnv uses real timers.
            jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(writeSpy).not.toHaveBeenCalled();
            fireEvent.changeText(screen.getByLabelText('Zip / Postcode'), '133836');
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                // Allow the existing failed-submit debounce to expire before retrying.
                jest.advanceTimersByTime(1000);
            });
            // Observe the real validator's errors before the retry, rather than assuming the edited form is valid.
            expect(wrapperSpy.mock.calls.at(-1)?.[0].errors).toEqual({});
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then the real action submits registered street/city with hydrated country/state and edited ZIP.
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_HOME_ADDRESS);
            expect(params).toEqual({
                homeAddressStreet: 'Old street',
                addressStreet2: 'Old suite',
                homeAddressCity: 'Toronto',
                addressState: 'Province',
                addressStateLong: 'Province',
                addressZipCode: '133836',
                addressCountry: 'VN',
            });
        } finally {
            jest.useRealTimers();
            wrapperSpy.mockRestore();
            writeSpy.mockRestore();
            formSpy.mockRestore();
        }
    });

    it('shows an empty country after deletion on a fresh mount and waits for app loading', async () => {
        // Given a deleted default and no saved address while the app is still loading.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.COUNTRY, 'US');
            await Onyx.set(ONYXKEYS.COUNTRY, null);
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        });
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByLabelText('State / Province')).toBeNull();

        // When loading finishes, the real form mounts from the hook's undefined default.
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        // Then no deleted value is resurrected into the selector.
        expect(screen.getByLabelText('State / Province')).toBeDefined();
        expect(screen.queryByText('United States')).toBeNull();
    });

    it('keeps raw default spelling through the country title and selection route', async () => {
        // Given an arbitrary persisted string, which remains a supported default input.
        const production = jest.replaceProperty(Config, 'IS_IN_PRODUCTION', true);
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        try {
            await TestHelper.signInWithTestUser();
            await act(async () => {
                await Onyx.set(ONYXKEYS.COUNTRY, 'Unknown Country');
            });
            renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
            await waitForBatchedUpdatesWithAct();
            const title = screen.getByText('allCountries.Unknown Country');
            const route = createDynamicRoute(DYNAMIC_ROUTES.ADDRESS_COUNTRY.getRoute('Unknown Country'));

            // When the real country selector is opened.
            const pressEvent = createMock<GestureResponderEvent>({nativeEvent: {}});
            fireEvent.press(title, pressEvent);

            // Then both the missing label and the route retain the raw string.
            expect(navigateSpy).toHaveBeenCalledWith(route);
            expect(screen.getByLabelText('State / Province')).toBeDefined();
        } finally {
            navigateSpy.mockRestore();
            alertSpy.mockRestore();
            production.restore();
        }
    });

    it('validates the US ZIP before submitting finite address values', async () => {
        // Given a complete US address with an invalid registered ZIP.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: '123 Main St', country: 'US', state: 'NY', city: 'New York', zip: 'bad'}]});
        });
        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
        await waitForBatchedUpdatesWithAct();
        writeSpy.mockClear().mockResolvedValue(undefined);
        const wrapperSpy = jest.spyOn(FormWrapperModule, 'default');
        try {
            // When the real validator rejects the ZIP, only an actual valid edit permits the next submission.
            // Control the real form's 1,000 ms submit debounce because setupAfterEnv uses real timers.
            jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(writeSpy).not.toHaveBeenCalled();
            fireEvent.changeText(screen.getByLabelText('Zip / Postcode'), '10001');
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });
            // Observe the real validator's errors before the retry, rather than assuming the edited form is valid.
            expect(wrapperSpy.mock.calls.at(-1)?.[0].errors).toEqual({});
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then the real personal-details action receives finite US data.
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_HOME_ADDRESS);
            expect(params).toEqual(expect.objectContaining({addressCountry: 'US', addressState: 'NY', addressZipCode: '10001', homeAddressCity: 'New York'}));
        } finally {
            jest.useRealTimers();
            wrapperSpy.mockRestore();
            writeSpy.mockRestore();
        }
    });

    it('retains registered city and ZIP through a finite country route and validates actual edits', async () => {
        // Given a fresh US form so this route case does not reuse an earlier successful submit/loading state.
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: [{street: '123 Main St', country: 'US', state: 'NY', city: 'New York', zip: '10001'}]});
        });
        const formSpy = jest.spyOn(AddressFormModule, 'default');
        writeSpy.mockClear().mockResolvedValue(undefined);
        const wrapperSpy = jest.spyOn(FormWrapperModule, 'default');
        try {
            renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);
            await waitForBatchedUpdatesWithAct();

            // When the validated route returns Canada, parent clears differ from retained registered values.
            await act(async () => {
                Navigation.setParams({country: 'CA'});
            });
            await waitForBatchedUpdatesWithAct();
            expect(formSpy.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({country: 'CA', state: '', city: '', zip: ''}));
            expect(screen.getByText('Canada')).toBeDefined();
            expect(screen.getByLabelText('State / Province').props.value).toBe('');
            expect(screen.getByLabelText('City').props.value).toBe('New York');
            expect(screen.getByLabelText('Zip / Postcode').props.value).toBe('10001');
            expect(navigationRef.getCurrentRoute()?.params).toEqual(expect.objectContaining({country: undefined}));
            // Control the real form's 1,000 ms submit debounce because setupAfterEnv uses real timers.
            jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(writeSpy).not.toHaveBeenCalled();
            fireEvent.changeText(screen.getByLabelText('State / Province'), 'Ontario');
            await waitForBatchedUpdatesWithAct();
            fireEvent.changeText(screen.getByLabelText('Zip / Postcode'), 'M5V 2T6');
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });
            // Observe the real validator's errors before the retry, rather than assuming the edited form is valid.
            expect(wrapperSpy.mock.calls.at(-1)?.[0].errors).toEqual({});
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();

            // Then actual edits pass CA validation while the submitted city retains its original registration.
            const [command, params] = getRequiredWriteCall(writeSpy.mock.calls);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_HOME_ADDRESS);
            expect(params).toEqual(
                expect.objectContaining({
                    addressCountry: 'CA',
                    addressState: 'Ontario',
                    addressStateLong: 'Ontario',
                    homeAddressCity: 'New York',
                    addressZipCode: 'M5V 2T6',
                }),
            );
        } finally {
            jest.useRealTimers();
            wrapperSpy.mockRestore();
            writeSpy.mockRestore();
            formSpy.mockRestore();
        }
    });
});

describe('country translation through the existing localization engine', () => {
    afterEach(async () => {
        await act(async () => {
            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    it('uses real locale loaders while retaining finite translation parameter inference', async () => {
        // Given the actual English and Spanish translation caches.
        await IntlStore.load(CONST.LOCALES.EN);
        await IntlStore.load(CONST.LOCALES.ES);

        // When the country entry and ordinary parameterized entry use explicit locales.
        const country: string | null = IntlStore.get('allCountries.US', CONST.LOCALES.EN);
        const addressLine: ((lineNumber: number) => string) | null = IntlStore.get('common.addressLine', CONST.LOCALES.EN);
        if (!addressLine) {
            throw new Error('Expected the real parameterized address-line translation.');
        }

        // Then country lookup shares the existing cache without widening finite function inference.
        expect(country).toBe('United States');
        expect(translateCountry(CONST.LOCALES.EN, 'US')).toBe('United States');
        // Keep the exact Spanish label to independently check the real locale.
        // cspell:disable-next-line
        expect(translateCountry(CONST.LOCALES.ES, 'US')).toBe('Estados Unidos de América');
        expect(translateCountry(undefined, 'Unknown Country')).toBe('allCountries.Unknown Country');
        expect(addressLine(2)).toBe('Address line 2');
        expect(translate(CONST.LOCALES.EN, 'common.addressLine', 2)).toBe('Address line 2');
        const finiteTranslationContract: {
            acceptsUnknownCountryPath: `allCountries.${string}` extends Parameters<typeof translate>[1] ? true : false;
            acceptsStringLineNumber: string extends Parameters<typeof translate<'common.addressLine'>>[2] ? true : false;
        } = {acceptsUnknownCountryPath: false, acceptsStringLineNumber: false};
        expect(finiteTranslationContract).toEqual({acceptsUnknownCountryPath: false, acceptsStringLineNumber: false});
    });

    it.each([
        {production: true, staging: false, country: 'production-missing-country'},
        {production: false, staging: true, country: 'staging-missing-country'},
    ])('retains lookup-cache and per-call missing alerts with $country', async ({production, staging, country}) => {
        // Given an uncached missing key in each supported deployment mode.
        await IntlStore.load(CONST.LOCALES.EN);
        const productionSetting = jest.replaceProperty(Config, 'IS_IN_PRODUCTION', production);
        const stagingSetting = jest.replaceProperty(Config, 'IS_IN_STAGING', staging);
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        try {
            // When the same country is translated twice, only the lookup's first alert is cached.
            const first = translateCountry(CONST.LOCALES.EN, country);
            expect(alertSpy).toHaveBeenCalledTimes(2);
            const second = translateCountry(CONST.LOCALES.EN, country);

            // Then the outer missing-key alert still runs on every translation call.
            expect(first).toBe(`allCountries.${country}`);
            expect(second).toBe(first);
            expect(alertSpy).toHaveBeenCalledTimes(3);
            expect(alertSpy).toHaveBeenNthCalledWith(1, `allCountries.${country} was not found in the en locale`);
            expect(alertSpy).toHaveBeenNthCalledWith(3, `allCountries.${country} was not found in the en locale`);
        } finally {
            alertSpy.mockRestore();
            productionSetting.restore();
            stagingSetting.restore();
        }
    });

    it('retains the development missing-key throw and cached lookup alert', async () => {
        // Given a distinct missing key and both deployment fallback flags disabled.
        await IntlStore.load(CONST.LOCALES.EN);
        const productionSetting = jest.replaceProperty(Config, 'IS_IN_PRODUCTION', false);
        const stagingSetting = jest.replaceProperty(Config, 'IS_IN_STAGING', false);
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        try {
            // When development translates the same missing country twice.
            expect(() => translateCountry(CONST.LOCALES.EN, 'development-missing-country')).toThrow('allCountries.development-missing-country was not found in the en locale');
            expect(() => translateCountry(CONST.LOCALES.EN, 'development-missing-country')).toThrow('allCountries.development-missing-country was not found in the en locale');

            // Then the engine throws on both calls but caches the inner missing lookup.
            expect(alertSpy).toHaveBeenCalledTimes(1);
        } finally {
            alertSpy.mockRestore();
            productionSetting.restore();
            stagingSetting.restore();
        }
    });
});
