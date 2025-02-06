import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {trackExpense} from '@libs/actions/IOU';
import {addPaymentCard, addSubscriptionPaymentCard} from '@libs/actions/PaymentMethods';
import {createWorkspace} from '@libs/actions/Policy/Policy';
import GoogleTagManager from '@libs/GoogleTagManager';
import OnboardingModalNavigator from '@libs/Navigation/AppNavigator/Navigators/OnboardingModalNavigator';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/GoogleTagManager');

// Mock the Overlay since it doesn't work in tests
jest.mock('@libs/Navigation/AppNavigator/Navigators/Overlay');

describe('GoogleTagManagerTest', () => {
    const accountID = 123456;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                session: {accountID},
            },
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('sign_up', () => {
        // When we render the OnboardingModal a few times
        const {rerender} = render(
            <NavigationContainer>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );
        rerender(
            <NavigationContainer>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );
        rerender(
            <NavigationContainer>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );

        // Then we publish the sign_up event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith(CONST.ANALYTICS.EVENT.SIGN_UP, accountID);
    });

    test('workspace_created', async () => {
        // When we run the createWorkspace action a few times
        createWorkspace();
        await waitForBatchedUpdates();
        createWorkspace();
        await waitForBatchedUpdates();
        createWorkspace();

        // Then we publish a workspace_created event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, accountID);
    });

    test('workspace_created - categorizeTrackedExpense', () => {
        trackExpense({
            report: {reportID: '123'},
            isDraftPolicy: true,
            action: CONST.IOU.ACTION.CATEGORIZE,
            participantParams: {
                payeeEmail: undefined,
                payeeAccountID: 0,
                participant: {accountID},
            },
            transactionParams: {
                amount: 1000,
                currency: 'USD',
                created: '2024-10-30',
                merchant: 'merchant',
                comment: 'comment',
                category: 'category',
                tag: 'tag',
                taxCode: 'taxCode',
                actionableWhisperReportActionID: 'actionableWhisperReportActionID',
                linkedTrackedExpenseReportAction: {actionName: 'IOU', reportActionID: 'linkedTrackedExpenseReportAction', created: '2024-10-30'},
                linkedTrackedExpenseReportID: 'linkedTrackedExpenseReportID',
            },
        });

        // Then we publish a workspace_created event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith('workspace_created', accountID);
    });

    test('paid_adoption - addPaymentCard', () => {
        // When we add a payment card
        addPaymentCard(accountID, {
            expirationDate: '2077-10-30',
            addressZipCode: 'addressZipCode',
            cardNumber: 'cardNumber',
            nameOnCard: 'nameOnCard',
            securityCode: 'securityCode',
        });

        // Then we publish a paid_adoption event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith(CONST.ANALYTICS.EVENT.PAID_ADOPTION, accountID);
    });

    test('paid_adoption - addSubscriptionPaymentCard', () => {
        // When we add a payment card
        addSubscriptionPaymentCard(accountID, {
            cardNumber: 'cardNumber',
            cardYear: 'cardYear',
            cardMonth: 'cardMonth',
            cardCVV: 'cardCVV',
            addressName: 'addressName',
            addressZip: 'addressZip',
            currency: 'USD',
        });

        // Then we publish a paid_adoption event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith(CONST.ANALYTICS.EVENT.PAID_ADOPTION, accountID);
    });
});
