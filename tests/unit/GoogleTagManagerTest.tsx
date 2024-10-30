import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import * as IOU from '@libs/actions/IOU';
import * as PaymentMethods from '@libs/actions/PaymentMethods';
import * as Policy from '@libs/actions/Policy/Policy';
import GoogleTagManager from '@libs/GoogleTagManager';
import OnboardingModalNavigator from '@libs/Navigation/AppNavigator/Navigators/OnboardingModalNavigator';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/GoogleTagManager');

// Mock the Overlay since it doesn't work in tests
jest.mock('@libs/Navigation/AppNavigator/Navigators/Overlay');

describe('GoogleTagManagerTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear();
    });

    it('publishes a sign_up event during onboarding', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

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
        expect(GoogleTagManager.publishEvent).toBeCalledWith('sign_up', accountID);
    });

    it('publishes a workspace_created event when the user creates their first one', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

        // When we run the createWorkspace action a few times
        Policy.createWorkspace();
        await waitForBatchedUpdates();
        Policy.createWorkspace();
        await waitForBatchedUpdates();
        Policy.createWorkspace();

        // Then we publish a workspace_created event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith('workspace_created', accountID);
    });

    it('publishes a workspace_created event when tracking an expense on a draft policy', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

        // When we categorize a tracked expense with a draft policy
        IOU.trackExpense(
            {reportID: '123'},
            1000,
            'USD',
            '2024-10-30',
            'merchant',
            undefined,
            0,
            {accountID},
            'comment',
            true,
            undefined,
            'category',
            'tag',
            'taxCode',
            0,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            CONST.IOU.ACTION.CATEGORIZE,
            'actionableWhisperReportActionID',
            {actionName: 'IOU', reportActionID: 'linkedTrackedExpenseReportAction', created: '2024-10-30'},
            'linkedTrackedExpenseReportID',
        );

        // Then we publish a workspace_created event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith('workspace_created', accountID);
    });

    it('publishes a paid_adoption event when a payment card is added', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

        // When we add a payment card
        PaymentMethods.addPaymentCard(accountID, {
            expirationDate: '2077-10-30',
            addressZipCode: 'addressZipCode',
            cardNumber: 'cardNumber',
            nameOnCard: 'nameOnCard',
            securityCode: 'securityCode',
        });

        // Then we publish a paid_adoption event only once
        expect(GoogleTagManager.publishEvent).toBeCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toBeCalledWith('paid_adoption', accountID);
    });

    it('publishes a paid_adoption event when a subscription payment card is added', async () => {
        // Given a new signed in account
        const accountID = 123456;
        await Onyx.merge(ONYXKEYS.SESSION, {accountID});

        // When we add a payment card
        PaymentMethods.addSubscriptionPaymentCard(accountID, {
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
        expect(GoogleTagManager.publishEvent).toBeCalledWith('paid_adoption', accountID);
    });
});
