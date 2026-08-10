import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import {openPersonalBankAccountSetupView} from '@src/libs/actions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import TimeSensitiveSection from '@src/pages/home/TimeSensitiveSection';
import useTimeSensitiveAddBankAccount from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddBankAccount';
import useTimeSensitiveAddPaymentCard from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddPaymentCard';

import type * as NativeNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@src/libs/actions/BankAccounts', () => ({
    openPersonalBankAccountSetupView: jest.fn(),
}));

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

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddBankAccount', () =>
    jest.fn(() => ({
        shouldShowAddBankAccount: true,
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

const renderTimeSensitiveSection = () =>
    render(
        <OnyxListItemProvider>
            <TimeSensitiveSection />
        </OnyxListItemProvider>,
    );

describe('TimeSensitiveSection - AddBankAccount', () => {
    const mockedUseTimeSensitiveAddBankAccount = jest.mocked(useTimeSensitiveAddBankAccount);
    const mockedUseTimeSensitiveAddPaymentCard = jest.mocked(useTimeSensitiveAddPaymentCard);

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockedUseTimeSensitiveAddBankAccount.mockReturnValue({
            shouldShowAddBankAccount: true,
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

    it('renders when it is the only time-sensitive item and starts setup', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: true});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();
        fireEvent.press(screen.getByText('common.add'));

        expect(screen.getByText('homePage.timeSensitiveSection.title')).toBeTruthy();
        expect(screen.getByText('homePage.timeSensitiveSection.addBankAccount.title')).toBeTruthy();
        expect(openPersonalBankAccountSetupView).toHaveBeenCalledWith({isUserValidated: true});
    });

    it('passes the unvalidated state to the setup flow', async () => {
        await Onyx.set(ONYXKEYS.ACCOUNT, {validated: false});
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();
        fireEvent.press(screen.getByText('common.add'));

        expect(openPersonalBankAccountSetupView).toHaveBeenCalledWith({isUserValidated: false});
    });
});
