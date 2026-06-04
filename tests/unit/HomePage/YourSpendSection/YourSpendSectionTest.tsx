import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Pressable as RNPressable, Text as RNText} from 'react-native';
import type {ValueOf} from 'type-fest';
import type * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import YourSpendSection from '@pages/home/YourSpendSection';
import type * as UseYourSpendDataModule from '@pages/home/YourSpendSection/useYourSpendData';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/useYourSpendData';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useFocusEffect: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
);

jest.mock('@hooks/useTheme', () =>
    jest.fn(() => ({
        success: '#00AA44',
        danger: '#E53935',
        border: '#DDDDDD',
        icon: '#888888',
    })),
);

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

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldUseNarrowLayout: false, isSmallScreenWidth: false})),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(() => [undefined]),
}));

// `getDisplayableExpensifyCards` is used by the per-card row to resolve a `Card` from the CARD_LIST
// Onyx collection. We stub it so cardRows assertions work without needing real Onyx data.
jest.mock('@libs/CardUtils', () => {
    const actual: typeof CardUtils = jest.requireActual('@libs/CardUtils');
    return {
        ...actual,
        getDisplayableExpensifyCards: jest.fn(() => [
            {cardID: 1, lastFourPAN: '1234', nameValuePairs: {}},
            {cardID: 2, lastFourPAN: '5678', nameValuePairs: {}},
        ]),
        getCardDescription: jest.fn(() => 'Card description'),
    };
});

// `MenuItemWithTopDescription` requires a ScreenWrapper transition context which isn't set up in this
// unit test. Replace it with a Pressable passthrough that still mounts left/right/title/description
// content and forwards `onPress` so row-level navigation can be exercised.
jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Pressable, Text} = jest.requireActual<{Pressable: typeof RNPressable; Text: typeof RNText}>('react-native');
    function MockMenuItemWithTopDescription({
        title,
        description,
        rightComponent,
        leftComponent,
        onPress,
    }: {
        title?: string;
        description?: string;
        rightComponent?: ReactNode;
        leftComponent?: ReactNode;
        onPress?: () => void;
    }) {
        return (
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
            >
                {leftComponent}
                {description ? <Text>{description}</Text> : null}
                {title ? <Text>{title}</Text> : null}
                {rightComponent}
            </Pressable>
        );
    }
    return MockMenuItemWithTopDescription;
});

jest.mock('@pages/home/YourSpendSection/useYourSpendData', () => {
    const actual: typeof UseYourSpendDataModule = jest.requireActual('@pages/home/YourSpendSection/useYourSpendData');
    return {
        ...actual,
        useYourSpendData: jest.fn(() => ({
            approvalRowState: actual.YOUR_SPEND_ROW_STATE.LOADING,
            approvalTotals: {total: undefined, currency: undefined},
            paymentRowState: actual.YOUR_SPEND_ROW_STATE.LOADING,
            paymentTotals: {total: undefined, currency: undefined},
            cardRows: [],
            awaitingApprovalQuery: '',
            repaidLast30DaysQuery: '',
        })),
    };
});

type MockHookData = {
    approvalRowState: ValueOf<typeof YOUR_SPEND_ROW_STATE>;
    approvalTotals: {total: number | undefined; currency: string | undefined};
    paymentRowState: ValueOf<typeof YOUR_SPEND_ROW_STATE>;
    paymentTotals: {total: number | undefined; currency: string | undefined};
    cardRows: Array<{cardID: number; query: string; lastFour: string; total: number | undefined; currency: string | undefined}>;
    awaitingApprovalQuery: string;
    repaidLast30DaysQuery: string;
};

function mockHook(data: Partial<MockHookData>) {
    (useYourSpendData as jest.Mock).mockReturnValue({
        approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
        approvalTotals: {total: undefined, currency: undefined},
        paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
        paymentTotals: {total: undefined, currency: undefined},
        cardRows: [],
        awaitingApprovalQuery: 'type:expense status:outstanding',
        repaidLast30DaysQuery: 'type:expense status:paid',
        ...data,
    });
}

describe('YourSpendSection', () => {
    it('renders without crashing when all rows are in LOADING state', () => {
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.LOADING,
            paymentRowState: YOUR_SPEND_ROW_STATE.LOADING,
        });
        expect(() => render(<YourSpendSection />)).not.toThrow();
    });

    it('renders approval row skeleton when approvalRowState is LOADING', () => {
        mockHook({approvalRowState: YOUR_SPEND_ROW_STATE.LOADING});
        render(<YourSpendSection />);
        expect(screen.getByTestId('your-spend-approval-skeleton')).toBeOnTheScreen();
    });

    it('renders approval row when approvalRowState is READY', () => {
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.READY,
            awaitingApprovalQuery: 'type:expense status:outstanding',
        });
        render(<YourSpendSection />);
        expect(screen.getByTestId('your-spend-approval-row')).toBeOnTheScreen();
    });

    it('hides approval row when approvalRowState is HIDDEN', () => {
        mockHook({approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN});
        render(<YourSpendSection />);
        expect(screen.queryByTestId('your-spend-approval-row')).toBeNull();
    });

    it('hides approval row when approvalRowState is HIDDEN_EMPTY (count === 0)', () => {
        mockHook({approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN_EMPTY});
        render(<YourSpendSection />);
        expect(screen.queryByTestId('your-spend-approval-row')).toBeNull();
    });

    it('navigates to SEARCH_ROOT when the approval row is tapped', () => {
        const approvalQuery = 'type:expense status:outstanding from:12345 reimbursable:yes';
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.READY,
            awaitingApprovalQuery: approvalQuery,
        });
        render(<YourSpendSection />);
        // Press the row description (translation key surfaces as the text in tests because
        // useLocalize is mocked to (key) => key).
        const description = screen.getByText('homePage.yourSpend.awaitingApproval');
        fireEvent.press(description);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: approvalQuery}));
    });

    it('renders a card row for each entry in cardRows', () => {
        mockHook({
            cardRows: [
                {cardID: 1, query: 'type:expense cardID:1', lastFour: '1234', total: undefined, currency: undefined},
                {cardID: 2, query: 'type:expense cardID:2', lastFour: '5678', total: undefined, currency: undefined},
            ],
        });
        render(<YourSpendSection />);
        expect(screen.getByTestId('your-spend-card-row-1')).toBeOnTheScreen();
        expect(screen.getByTestId('your-spend-card-row-2')).toBeOnTheScreen();
    });

    it('returns null (slot not rendered) when all rows are HIDDEN', () => {
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            cardRows: [],
        });
        const {toJSON} = render(<YourSpendSection />);
        expect(toJSON()).toBeNull();
    });
});
