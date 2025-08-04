import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax
import * as ShouldShowSubscriptionPaymentOptionModule from '@libs/shouldShowSubscriptionPaymentOption';
// eslint-disable-next-line no-restricted-syntax
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CardSection from '@pages/settings/Subscription/CardSection/CardSection';
import ONYXKEYS from '@src/ONYXKEYS';
import CardSectionUtils from '@src/pages/settings/Subscription/CardSection/utils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/getPlatform');
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
);

describe('CardSectionTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    test('shows retry payment and authenticate button when retry is available and platform is web', async () => {
        jest.spyOn(ShouldShowSubscriptionPaymentOptionModule, 'default').mockReturnValue(true);
        jest.spyOn(CardSectionUtils, 'getBillingStatus').mockReturnValue({
            title: 'subscription.billingBanner.policyOwnerAmountOwed.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwed.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
        jest.spyOn(SubscriptionUtils, 'hasCardAuthenticatedError').mockReturnValue(true);

        render(<CardSection />);
        expect(await screen.findByText('subscription.cardSection.retryPaymentButton')).toBeTruthy();
        expect(await screen.findByText('subscription.cardSection.authenticatePayment')).toBeTruthy();
    });

    test('hides retry payment and authenticate button on native platforms', () => {
        jest.spyOn(ShouldShowSubscriptionPaymentOptionModule, 'default').mockReturnValue(false);
        jest.spyOn(CardSectionUtils, 'getBillingStatus').mockReturnValue({
            title: 'subscription.billingBanner.policyOwnerAmountOwed.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwed.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
        jest.spyOn(SubscriptionUtils, 'hasCardAuthenticatedError').mockReturnValue(true);

        render(<CardSection />);
        expect(screen.queryByText('subscription.cardSection.retryPaymentButton')).toBeNull();
        expect(screen.queryByText('subscription.cardSection.authenticatePayment')).toBeNull();
    });
});
