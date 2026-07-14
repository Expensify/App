import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import {ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT} from '@libs/ProductMarketingWindowUtils';

import en from '@src/languages/en';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {Text} from 'react-native';
import Onyx from 'react-native-onyx';

import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const USER_EMAIL = 'user@example.com';
const USER_ACCOUNT_ID = 7;
const FIRST_SCREEN_TEXT = 'First screen content';
const SECOND_SCREEN_TEXT = 'Second screen content';
const MODAL_SCREEN_TEXT = 'Centered modal screen content';

const announcement = ACTIVE_PRODUCT_MARKETING_ANNOUNCEMENT;
if (!announcement) {
    throw new Error('These tests require an active product marketing announcement; update them if the active announcement is removed.');
}
const memberHeading = en.productMarketingWindow.expensePolicyPdf.member.heading;

type TestRootParamList = {
    [SCREENS.CONCIERGE]: undefined;
    [SCREENS.NOT_FOUND]: undefined;
    [NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR]: undefined;
};

const RootStack = createRootStackNavigator<TestRootParamList>();

function FirstScreen() {
    return <Text>{FIRST_SCREEN_TEXT}</Text>;
}

function SecondScreen() {
    return <Text>{SECOND_SCREEN_TEXT}</Text>;
}

function ModalScreen() {
    return <Text>{MODAL_SCREEN_TEXT}</Text>;
}

// The product marketing window is mounted through the root navigator's extra content (RootNavigatorExtraContent),
// so rendering the real root stack navigator exercises the actual mounting path used by the app.
const renderRootNavigator = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
            <NavigationContainer ref={navigationRef}>
                <RootStack.Navigator initialRouteName={SCREENS.CONCIERGE}>
                    <RootStack.Screen
                        name={SCREENS.CONCIERGE}
                        component={FirstScreen}
                    />
                    <RootStack.Screen
                        name={SCREENS.NOT_FOUND}
                        component={SecondScreen}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR}
                        component={ModalScreen}
                    />
                </RootStack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );

describe('ProductMarketingWindow across navigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('stays visible when the user navigates to another route, and hides under a screen-based centered modal', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'User'),
            });
            await Onyx.merge(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });

        renderRootNavigator();
        await waitForBatchedUpdatesWithAct();

        // The window is visible alongside the first screen.
        expect(screen.getByText(FIRST_SCREEN_TEXT)).toBeTruthy();
        expect(screen.getByText(memberHeading)).toBeTruthy();

        await act(async () => {
            navigationRef.current?.navigate(SCREENS.NOT_FOUND as never);
            await waitForBatchedUpdatesWithAct();
        });

        // The second screen is now shown and the window is still visible because it never unmounted.
        expect(screen.getByText(SECOND_SCREEN_TEXT)).toBeTruthy();
        expect(screen.getByText(memberHeading)).toBeTruthy();

        await act(async () => {
            navigationRef.current?.navigate(NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR as never);
            await waitForBatchedUpdatesWithAct();
        });

        // A screen-based centered modal takes precedence: the window is hidden while it is on top…
        expect(screen.getByText(MODAL_SCREEN_TEXT)).toBeTruthy();
        expect(screen.queryByText(memberHeading)).toBeNull();

        await act(async () => {
            navigationRef.current?.goBack();
            await waitForBatchedUpdatesWithAct();
        });

        // …and shows again once the modal screen is closed.
        expect(screen.getByText(memberHeading)).toBeTruthy();
    });
});
