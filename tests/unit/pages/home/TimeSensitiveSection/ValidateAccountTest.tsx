import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import TimeSensitiveSection from '@src/pages/home/TimeSensitiveSection';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        EnvelopeOpenStar: () => null,
    })),
}));

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveOffers', () =>
    jest.fn(() => ({
        shouldShow50off: false,
        shouldShow25off: false,
        shouldShowAddPaymentCard: false,
        firstDayFreeTrial: undefined,
        discountInfo: undefined,
    })),
);

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveCards', () =>
    jest.fn(() => ({
        shouldShowAddShippingAddress: false,
        shouldShowActivateCard: false,
        shouldShowReviewCardFraud: false,
        cardsNeedingShippingAddress: [],
        cardsNeedingActivation: [],
        cardsWithFraud: [],
    })),
);

jest.mock('@hooks/useCardFeedErrors', () =>
    jest.fn(() => ({
        cardsWithBrokenFeedConnection: {},
        personalCardsWithBrokenConnection: {},
    })),
);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'test@example.com'})));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

const renderTimeSensitiveSection = () =>
    render(
        <OnyxListItemProvider>
            <TimeSensitiveSection />
        </OnyxListItemProvider>,
    );

describe('TimeSensitiveSection - ValidateAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows ValidateAccount widget when account is not validated', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.validateAccount.title')).toBeTruthy();
    });

    it('hides ValidateAccount widget when account is validated', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.queryByText('homePage.timeSensitiveSection.validateAccount.title')).toBeNull();
    });
});
