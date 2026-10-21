import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import useTimeSensitiveAddBankAccount from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddBankAccount';
import useTimeSensitiveAddDepositAccount from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddDepositAccount';
import useTimeSensitiveAddPaymentCard from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddPaymentCard';
import useTimeSensitiveItems from '@src/pages/home/TimeSensitiveSection/useTimeSensitiveItems';
import ROUTES from '@src/ROUTES';

import type * as NativeNavigation from '@react-navigation/native';

import {View} from 'react-native';
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
        Bank: () => null,
    })),
}));

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddDepositAccount', () =>
    jest.fn(() => ({
        shouldShowAddDepositAccount: true,
    })),
);

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
    const items = useTimeSensitiveItems();
    return <View>{items}</View>;
}

const renderTimeSensitiveSection = () =>
    render(
        <OnyxListItemProvider>
            <TimeSensitiveSection />
        </OnyxListItemProvider>,
    );

describe('TimeSensitiveSection - AddDepositAccount', () => {
    const mockedUseTimeSensitiveAddDepositAccount = jest.mocked(useTimeSensitiveAddDepositAccount);
    const mockedUseTimeSensitiveAddBankAccount = jest.mocked(useTimeSensitiveAddBankAccount);
    const mockedUseTimeSensitiveAddPaymentCard = jest.mocked(useTimeSensitiveAddPaymentCard);

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockedUseTimeSensitiveAddDepositAccount.mockReturnValue({
            shouldShowAddDepositAccount: true,
        });
        mockedUseTimeSensitiveAddBankAccount.mockReturnValue({
            shouldShowAddBankAccount: false,
        });
        mockedUseTimeSensitiveAddPaymentCard.mockReturnValue({
            shouldShowAddPaymentCard: false,
        });
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('renders the task and opens the deposit account setup flow', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();
        fireEvent.press(screen.getByText('homePage.timeSensitiveSection.ctaFix'));

        expect(screen.getByText('homePage.timeSensitiveSection.addDepositAccount.title')).toBeTruthy();
        // Opens the collect deposit account flow, the same one the Wallet page opens for a collecting member
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_COLLECT_DEPOSIT_ACCOUNT.getRoute());
    });

    it('yields to the queued-payment task so the same flow is not offered twice', async () => {
        mockedUseTimeSensitiveAddBankAccount.mockReturnValue({
            shouldShowAddBankAccount: true,
        });
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.addBankAccount.title')).toBeTruthy();
        expect(screen.queryByText('homePage.timeSensitiveSection.addDepositAccount.title')).toBeNull();
    });
});
