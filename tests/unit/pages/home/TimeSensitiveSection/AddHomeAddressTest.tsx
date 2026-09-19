import {fireEvent, render, screen} from '@testing-library/react-native';

import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import AddHomeAddress from '@src/pages/home/TimeSensitiveSection/items/AddHomeAddress';
import TimeSensitiveGroup from '@src/pages/home/TimeSensitiveSection/TimeSensitiveGroup';
import useTimeSensitiveItems from '@src/pages/home/TimeSensitiveSection/useTimeSensitiveItems';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

import type * as NativeNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const mockRootState: ReturnType<typeof navigationRef.getRootState> = {
    key: 'root',
    index: 0,
    routeNames: [],
    routes: [],
    type: 'stack',
    stale: false,
};

jest.mock('@libs/Navigation/Navigation');

jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget');

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

jest.mock('@hooks/useTheme', () => jest.fn(() => ({white: '#fff'})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => jest.fn(() => ({})),
                },
            ),
    ),
);

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

describe('AddHomeAddress navigation', () => {
    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(swapBackgroundTabForRHPTarget).mockClear();
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(mockRootState);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens private personal details on top of the profile page', () => {
        render(<AddHomeAddress />);

        fireEvent.press(screen.getByText('homePage.timeSensitiveSection.addHomeAddress.cta'));

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
        expect(swapBackgroundTabForRHPTarget).toHaveBeenCalledWith(mockRootState, ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
    });
});
