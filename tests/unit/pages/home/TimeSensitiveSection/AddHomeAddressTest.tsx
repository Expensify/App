import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import TimeSensitiveGroup from '@src/pages/home/TimeSensitiveSection/TimeSensitiveGroup';
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
        Home: () => null,
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
        shouldShowAddVirtualCardPersonalDetails: false,
        cardsNeedingShippingAddress: [],
        cardsNeedingActivation: [],
        cardsWithFraud: [],
        virtualCardsNeedingPersonalDetails: [],
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
    return <TimeSensitiveGroup items={useTimeSensitiveItems()} />;
}

const renderTimeSensitiveSection = () =>
    render(
        <OnyxListItemProvider>
            <TimeSensitiveSection />
        </OnyxListItemProvider>,
    );

describe('TimeSensitiveSection - AddHomeAddress', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('renders AddHomeAddress when an active workspace uses home and office commuter exclusions', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {
            id: '1',
            name: 'Boulder Development',
            areDistanceRatesEnabled: true,
            commuterExclusions: {method: 'homeAndOffice'},
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.addHomeAddress.title')).toBeTruthy();
    });

    it('hides AddHomeAddress when distance rates are disabled', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {
            id: '1',
            name: 'Boulder Development',
            areDistanceRatesEnabled: false,
            commuterExclusions: {method: 'homeAndOffice'},
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.queryByText('homePage.timeSensitiveSection.addHomeAddress.title')).toBeNull();
    });
});
