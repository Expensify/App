import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import TimeSensitiveSection from '@src/pages/home/TimeSensitiveSection';
import useTimeSensitiveOffers from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveOffers';
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
    const mockedUseTimeSensitiveOffers = jest.mocked(useTimeSensitiveOffers);

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockedUseTimeSensitiveOffers.mockReturnValue({
            shouldShow50off: false,
            shouldShow25off: false,
            shouldShowAddPaymentCard: false,
            firstDayFreeTrial: undefined,
            discountInfo: null,
        });
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows ValidateAccount widget when account is not validated', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.validateAccount.title')).toBeTruthy();
    });

    it('hides ValidateAccount for anonymous users while keeping time sensitive section visible', async () => {
        mockedUseTimeSensitiveOffers.mockReturnValue({
            shouldShow50off: false,
            shouldShow25off: false,
            shouldShowAddPaymentCard: true,
            firstDayFreeTrial: undefined,
            discountInfo: null,
        });

        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.title')).toBeTruthy();
        expect(screen.getByText('homePage.timeSensitiveSection.addPaymentCard.title')).toBeTruthy();
        expect(screen.queryByText('homePage.timeSensitiveSection.validateAccount.title')).toBeNull();
    });

    it('hides ValidateAccount when current login is already validated in login list', async () => {
        const validatedEmail = 'test@example.com';

        mockedUseTimeSensitiveOffers.mockReturnValue({
            shouldShow50off: false,
            shouldShow25off: false,
            shouldShowAddPaymentCard: true,
            firstDayFreeTrial: undefined,
            discountInfo: null,
        });

        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT, email: validatedEmail});
        await Onyx.set(ONYXKEYS.LOGIN_LIST, {
            [validatedEmail]: {
                validatedDate: '2026-03-18 00:00:00.000',
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.title')).toBeTruthy();
        expect(screen.getByText('homePage.timeSensitiveSection.addPaymentCard.title')).toBeTruthy();
        expect(screen.queryByText('homePage.timeSensitiveSection.validateAccount.title')).toBeNull();
    });
});
