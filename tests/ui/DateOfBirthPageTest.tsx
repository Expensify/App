import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import {format, subYears} from 'date-fns';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import DateOfBirthPage from '@pages/settings/Profile/PersonalDetails/DateOfBirthPage';
import type {DateInputWithPickerProps} from '@src/components/DatePicker/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockDatePicker = jest.fn<null, [DateInputWithPickerProps]>(() => null);

jest.mock(
    '@components/DatePicker',
    () =>
        function MockDatePicker(props: DateInputWithPickerProps) {
            mockDatePicker(props);
            return null;
        },
);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH}
                            component={DateOfBirthPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('DateOfBirthPage', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(() => {
        mockDatePicker.mockClear();
    });

    it('should reuse the shared 18 plus DOB constraint for the profile date picker', async () => {
        const expectedDOB = '2000-01-01';
        const expectedMinDate = format(subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE), CONST.DATE.FNS_FORMAT_STRING);
        const expectedMaxDate = format(subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT), CONST.DATE.FNS_FORMAT_STRING);

        await TestHelper.signInWithTestUser();

        // Given the private details page is opened for a user with an existing DOB
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {dob: expectedDOB});
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();

        // When the page renders the DOB input
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('DateOfBirthPage')).toBeOnTheScreen();

        // Then the page should pass the shared 18+ DOB range into the picker instead of allowing dates up to today
        const lastCall = mockDatePicker.mock.lastCall?.[0];
        expect(lastCall).toBeDefined();
        expect(lastCall?.value ?? lastCall?.defaultValue).toBe(expectedDOB);
        if (!lastCall?.minDate || !lastCall?.maxDate) {
            throw new Error('Expected DateOfBirthPage to pass minDate and maxDate to DatePicker');
        }
        expect(format(lastCall.minDate, CONST.DATE.FNS_FORMAT_STRING)).toBe(expectedMinDate);
        expect(format(lastCall.maxDate, CONST.DATE.FNS_FORMAT_STRING)).toBe(expectedMaxDate);
    });
});
