import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ExpensifyCodePage from '@pages/settings/Subscription/ExpensifyCodePage';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@pages/settings/Subscription/ExpensifyCodePage', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@pages/settings/Subscription/ExpensifyCodePage/index.tsx'),
);

jest.mock('@userActions/Subscription', () => ({
    applyExpensifyCode: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const actual = jest.requireActual<typeof Navigation>('@libs/Navigation/Navigation');
    return {
        ...actual,
        goBack: jest.fn(),
        getTopmostReportId: jest.fn(() => undefined),
        dismissModal: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
    };
});

jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {View, Text} = jest.requireActual<typeof import('react-native')>('react-native');
    function MockErrorPage() {
        return (
            <View testID="NotFoundPage">
                <Text>Not Found</Text>
            </View>
        );
    }
    return MockErrorPage;
});

const {applyExpensifyCode} = jest.requireMock<{applyExpensifyCode: jest.Mock}>('@userActions/Subscription');

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.SUBSCRIPTION.EXPENSIFY_CODE}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.SUBSCRIPTION.EXPENSIFY_CODE}
                            component={ExpensifyCodePage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('ExpensifyCodePage', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {expensifyCode: null});
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('renders the form with title, description and discount code input', async () => {
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('subscription.expensifyCode.title'))).toBeOnTheScreen();
        expect(screen.getByText(TestHelper.translateLocal('subscription.expensifyCode.enterCode'))).toBeOnTheScreen();
        expect(screen.getByTestId('expensify-code-input')).toBeOnTheScreen();
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')})).toBeOnTheScreen();
    });

    it('show validation error when submitting empty code', async () => {
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const applyButton = screen.getByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')});
        fireEvent.press(applyButton);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('common.error.fieldRequired'))).toBeOnTheScreen();
        expect(applyExpensifyCode).not.toHaveBeenCalled();
    });

    it('calls applyExpensifyCode when submitting valid code', async () => {
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId('expensify-code-input');
        fireEvent.changeText(input, 'HappyDays100Off');
        await waitForBatchedUpdatesWithAct();

        const applyButton = screen.getByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')});
        fireEvent.press(applyButton);
        await waitForBatchedUpdatesWithAct();

        expect(applyExpensifyCode).toHaveBeenCalledTimes(1);
        expect(applyExpensifyCode).toHaveBeenCalledWith('HappyDays100Off');
    });

    it('show NotFoundPage when subscription already has expensifyCode', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {expensifyCode: 'APPLIED_CODE'});
        });
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
        expect(screen.queryByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')})).not.toBeOnTheScreen();
    });

    it('navigate back when expensifyCode is set in subscription after submit', async () => {
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId('expensify-code-input');
        fireEvent.changeText(input, '2026EarlyAdoption50');
        const applyButton = screen.getByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')});
        fireEvent.press(applyButton);
        await waitForBatchedUpdatesWithAct();

        expect(applyExpensifyCode).toHaveBeenCalledWith('2026EarlyAdoption50');

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {expensifyCode: '2026EarlyAdoption50'});
        });
        await waitFor(() => {
            expect(Navigation.goBack).toHaveBeenCalled();
        });
    });

    it('stay on page when expensifyCode is invalid', async () => {
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId('expensify-code-input');
        fireEvent.changeText(input, 'InvalidCode');
        const applyButton = screen.getByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')});
        fireEvent.press(applyButton);
        await waitForBatchedUpdatesWithAct();

        expect(applyExpensifyCode).toHaveBeenCalledWith('InvalidCode');

        expect(screen.getByRole('button', {name: TestHelper.translateLocal('subscription.expensifyCode.apply')})).toBeOnTheScreen();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
});
