import {NavigationContainer} from '@react-navigation/native';
import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import {startMoneyRequest} from '@libs/actions/IOU';
import navigationRef from '@libs/Navigation/navigationRef';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../utils/collections/policies';
import {createPolicyExpenseChat} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => (): {shouldUseNarrowLayout: boolean} => ({shouldUseNarrowLayout: false}));

const SS_EMAIL = 'testing@gmail.com';
const SS_ACCOUNT_ID = 1;

describe('FloatingReceiptButton hover', () => {
    const onPress = jest.fn();

    const renderFAB = () =>
        render(
            <NavigationContainer>
                <FloatingReceiptButton
                    onPress={onPress}
                    accessibilityLabel="fab"
                    role={CONST.ROLE.BUTTON}
                />
            </NavigationContainer>,
        );

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('changes background color on hover', () => {
        renderFAB();

        // Get the receipt button by testID
        const frb = screen.getByTestId('floating-receipt-button');

        // Get the container by testID
        const container = screen.getByTestId('floating-receipt-button-container');

        // Before hover, should not have greenHover background
        expect(container).not.toHaveStyle({backgroundColor: colors.greenHover});

        // Test hover in
        fireEvent(frb, 'hoverIn');
        expect(container).toHaveStyle({backgroundColor: colors.greenHover});

        // Test hover out
        fireEvent(frb, 'hoverOut');
        expect(container).not.toHaveStyle({backgroundColor: colors.greenHover});
    });
});

describe('FloatingReceiptButton onPress', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        return jest.clearAllMocks();
    });

    it('should call startMoneyRequest with CREATE iouType when there is no active policy', () => {
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
                <NavigationContainer
                    ref={navigationRef}
                    onReady={() => {}}
                >
                    <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />
                </NavigationContainer>
            </ComposeProviders>,
        );

        const floatingReceiptButton = screen.getByTestId('floating-receipt-button');
        expect(floatingReceiptButton).toBeVisible();

        fireEvent.press(floatingReceiptButton);

        expect(startMoneyRequest).toHaveBeenCalled();
        const [[iouType]] = (startMoneyRequest as jest.MockedFunction<typeof startMoneyRequest>).mock.calls;
        expect(iouType).toEqual(CONST.IOU.TYPE.CREATE);
    });

    it('should call startMoneyRequest with SUBMIT iouType when there is an active policy', async () => {
        const fakePolicy = {...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM), isPolicyExpenseChatEnabled: true};
        const fakeReport = {...createPolicyExpenseChat(0), ownerAccountID: SS_ACCOUNT_ID};
        await Onyx.set(ONYXKEYS.SESSION, {email: SS_EMAIL, accountID: SS_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
        await Onyx.set(`${ONYXKEYS.NVP_ACTIVE_POLICY_ID}`, fakePolicy.id);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);

        await waitForBatchedUpdates();

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
                <NavigationContainer
                    ref={navigationRef}
                    onReady={() => {}}
                >
                    <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />
                </NavigationContainer>
            </ComposeProviders>,
        );

        await waitForBatchedUpdates();

        const floatingReceiptButton = screen.getByTestId('floating-receipt-button');
        expect(floatingReceiptButton).toBeVisible();

        fireEvent.press(floatingReceiptButton);

        expect(startMoneyRequest).toHaveBeenCalled();
        const [[iouType, reportID]] = (startMoneyRequest as jest.MockedFunction<typeof startMoneyRequest>).mock.calls;
        expect(iouType).toEqual(CONST.IOU.TYPE.SUBMIT);
        expect(reportID).toEqual(fakeReport.reportID);
    });
});
