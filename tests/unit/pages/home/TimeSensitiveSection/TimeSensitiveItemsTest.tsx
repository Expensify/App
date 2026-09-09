import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import HomeTaskGroup from '@src/pages/home/HomeTaskGroup';
import useTimeSensitiveAddPaymentCard from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddPaymentCard';
import useTimeSensitiveItems from '@src/pages/home/TimeSensitiveSection/useTimeSensitiveItems';

import type * as NativeNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useFocusEffect: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        CreditCard: () => null,
    })),
}));

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddBankAccount', () =>
    jest.fn(() => ({
        shouldShowAddBankAccount: false,
    })),
);

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddPaymentCard', () =>
    jest.fn(() => ({
        shouldShowAddPaymentCard: false,
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

function TimeSensitiveSection() {
    return (
        <HomeTaskGroup
            title="homePage.timeSensitiveSection.title"
            rows={useTimeSensitiveItems()}
        />
    );
}

const renderTimeSensitiveSection = () =>
    render(
        <OnyxListItemProvider>
            <TimeSensitiveSection />
        </OnyxListItemProvider>,
    );

describe('TimeSensitiveSection - unvalidated account', () => {
    const mockedUseTimeSensitiveAddPaymentCard = jest.mocked(useTimeSensitiveAddPaymentCard);

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockedUseTimeSensitiveAddPaymentCard.mockReturnValue({
            shouldShowAddPaymentCard: false,
        });
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('renders no Time sensitive rows for an unvalidated account with nothing else to fix', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        // The group renders nothing without rows, so an unvalidated account on its own no longer produces a Home task.
        expect(screen.queryByText('homePage.timeSensitiveSection.title')).toBeNull();
    });

    it('keeps the other rows for an unvalidated account without adding a validate row ahead of them', async () => {
        mockedUseTimeSensitiveAddPaymentCard.mockReturnValue({
            shouldShowAddPaymentCard: true,
        });

        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.title')).toBeTruthy();
        expect(screen.getByText('homePage.timeSensitiveSection.addPaymentCard.title')).toBeTruthy();
        expect(screen.queryByText(/validateAccount/)).toBeNull();
    });
});
