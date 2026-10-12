import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CardSection from '@pages/settings/Subscription/CardSection/CardSection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {addDays, format} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBackToHome: jest.fn(),
    },
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn()}),
}));

// Replace each banner with its name so the test only checks which banner the section picks
jest.mock('@pages/settings/Subscription/CardSection/BillingBanner/PreTrialBillingBanner', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {Text: MockText} = jest.requireActual<typeof import('react-native')>('react-native');
    return () => <MockText>PreTrialBillingBanner</MockText>;
});
jest.mock('@pages/settings/Subscription/CardSection/BillingBanner/TrialStartedBillingBanner', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {Text: MockText} = jest.requireActual<typeof import('react-native')>('react-native');
    return () => <MockText>TrialStartedBillingBanner</MockText>;
});
jest.mock('@pages/settings/Subscription/CardSection/BillingBanner/SubscriptionExpiringSoonBanner', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {Text: MockText} = jest.requireActual<typeof import('react-native')>('react-native');
    return () => <MockText>SubscriptionExpiringSoonBanner</MockText>;
});
jest.mock('@pages/settings/Subscription/CardSection/BillingBanner/EarlyRenewalBillingBanner', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const {Text: MockText} = jest.requireActual<typeof import('react-native')>('react-native');
    return () => <MockText>EarlyRenewalBillingBanner</MockText>;
});
jest.mock('@pages/settings/Subscription/CardSection/CardSectionDataEmpty', () => () => null);

// Pin the campaign to its non-incentivized window so the offer's visibility depends only on eligibility
jest.mock('@hooks/useEarlyRenewalPeriod', () => () => ({isNonIncentivizedPeriod: true, isIncentivizedPeriod: false}));

function renderCardSection() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <CardSection />
        </ComposeProviders>,
    );
}

describe('CardSection billing banner', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the expiring soon banner instead of the pre-trial banner when the free trial NVPs are absent', async () => {
        // Given an annual subscriber with auto-renew off, an end date inside the next month, and no free trial NVPs,
        // which on its own also satisfies the pre-trial check
        await Onyx.merge(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {
            type: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            autoRenew: false,
            endDate: format(addDays(new Date(), 10), CONST.DATE.FNS_FORMAT_STRING),
        });
        await waitForBatchedUpdatesWithAct();

        // When the Subscription page card section renders
        renderCardSection();
        await waitForBatchedUpdatesWithAct();

        // Then the owner sees the expiring soon warning, not the pre-trial banner
        expect(screen.getByText('SubscriptionExpiringSoonBanner')).toBeOnTheScreen();
        expect(screen.queryByText('PreTrialBillingBanner')).not.toBeOnTheScreen();
    });

    it('shows the early renewal offer instead of the expiring soon banner when the owner can claim it', async () => {
        // Given an annual subscriber whose subscription is expiring soon and who is eligible to renew early,
        // since renewing early is what resolves the expiring subscription
        await Onyx.merge(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {
            type: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            autoRenew: false,
            endDate: format(addDays(new Date(), 10), CONST.DATE.FNS_FORMAT_STRING),
        });
        await Onyx.set(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY, {canClaim: true});
        await waitForBatchedUpdatesWithAct();

        // When the Subscription page card section renders
        renderCardSection();
        await waitForBatchedUpdatesWithAct();

        // Then the owner sees the early renewal offer, not the expiring soon warning
        expect(screen.getByText('EarlyRenewalBillingBanner')).toBeOnTheScreen();
        expect(screen.queryByText('SubscriptionExpiringSoonBanner')).not.toBeOnTheScreen();
    });
});
