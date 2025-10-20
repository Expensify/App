import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import ProfilePage from '@pages/settings/Profile/ProfilePage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Icon/Illustrations');

const Stack = createPlatformStackNavigator<SettingsSplitNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.SETTINGS.PROFILE.ROOT) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.ROOT}
                            component={ProfilePage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('ProfilePage', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display phone number without @expensify.sms domain in display name field', async () => {
        const phoneNumber = '+15857527441';
        const accountID = 123;

        await TestHelper.signInWithTestUser(accountID, `${phoneNumber}@expensify.sms`);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: `${phoneNumber}@expensify.sms`,
                displayName: `${phoneNumber}@expensify.sms`,
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPage(SCREENS.SETTINGS.PROFILE.ROOT);

        await waitForBatchedUpdatesWithAct();

        // Verify "Display name" label exists
        const displayNameLabel = screen.getByText('Display name');
        expect(displayNameLabel).toBeOnTheScreen();

        // Get the component tree and stringify to check for @expensify.sms
        const tree = screen.toJSON();
        const treeString = JSON.stringify(tree);

        // Verify @expensify.sms is NOT present in the display name field
        // The display name field should show the formatted phone number without the domain
        expect(treeString).not.toContain(`${phoneNumber}@expensify.sms`);
    });

    it('should display custom display name without SMS domain when user has set a name', async () => {
        const phoneNumber = '+15857527441';
        const accountID = 123;
        const customDisplayName = 'John Doe';

        await TestHelper.signInWithTestUser(accountID, `${phoneNumber}@expensify.sms`);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: `${phoneNumber}@expensify.sms`,
                displayName: customDisplayName,
                firstName: 'John',
                lastName: 'Doe',
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPage(SCREENS.SETTINGS.PROFILE.ROOT);

        await waitForBatchedUpdatesWithAct();

        // Verify "Display name" label exists
        const displayNameLabel = screen.getByText('Display name');
        expect(displayNameLabel).toBeOnTheScreen();

        // Verify @expensify.sms is NOT present anywhere on the page
        const tree = screen.toJSON();
        const treeString = JSON.stringify(tree);
        expect(treeString).not.toContain('@expensify.sms');

        // Verify the display name section does not show the SMS domain suffix
        expect(treeString).not.toContain(`${phoneNumber}@expensify.sms`);
    });
});
