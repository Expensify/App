import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import AddPaymentCard from '@pages/settings/Subscription/PaymentCard';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    UnreadIndicatorUpdaterHelper: jest.fn(),
    getReportIDFromLink: jest.fn(() => ''),
    parseReportRouteParams: jest.fn(() => ({reportID: ''})),
}));

jest.mock('@pages/settings/Subscription/PaymentCard', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jest.requireActual('@pages/settings/Subscription/PaymentCard/index.tsx');
});

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('Subscription/AddPaymentCard', () => {
    const Stack = createStackNavigator();

    const renderAddPaymentCardPage = (initialRouteName: typeof SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD) => {
        return render(
            <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
                <PortalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={initialRouteName}>
                            <Stack.Screen
                                name={SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD}
                                component={AddPaymentCard}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </PortalProvider>
            </ComposeProviders>,
        );
    };

    describe('AddPaymentCardPage Expiration Date Formatting', () => {
        const runFormatTest = async (input: string, formattedAs: string) => {
            renderAddPaymentCardPage(SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD);
            const expirationDateField = await screen.findByTestId('addPaymentCardPage.expiration');
            fireEvent.changeText(expirationDateField, input);
            expect(expirationDateField.props.value).toBe(formattedAs);
        };

        it('formats "0" as "0"', async () => {
            await runFormatTest('0', '0');
        });

        it('formats "2" as "02/"', async () => {
            await runFormatTest('2', '02/');
        });

        it('formats "11" as "11/"', async () => {
            await runFormatTest('11', '11/');
        });

        it('formats "13" as "01/3"', async () => {
            await runFormatTest('13', '01/3');
        });

        it('formats "20" as "02/0"', async () => {
            await runFormatTest('20', '02/0');
        });

        it('formats "45" as "04/5"', async () => {
            await runFormatTest('45', '04/5');
        });

        it('formats "98" as "09/8"', async () => {
            await runFormatTest('98', '09/8');
        });

        it('formats "123" as "12/3"', async () => {
            await runFormatTest('123', '12/3');
        });

        it('formats "567" as "05/67"', async () => {
            await runFormatTest('567', '05/67');
        });

        it('formats "00" as "0"', async () => {
            await runFormatTest('00', '0');
        });

        it('formats "11111" as "11/11"', async () => {
            await runFormatTest('11111', '11/11');
        });

        it('formats "99/99" as "09/99"', async () => {
            await runFormatTest('99/99', '09/99');
        });

        it('formats "0825" as "08/25"', async () => {
            await runFormatTest('0825', '08/25');
        });

        it('formats "12255" as "12/25"', async () => {
            await runFormatTest('12255', '12/25');
        });
    });
});
