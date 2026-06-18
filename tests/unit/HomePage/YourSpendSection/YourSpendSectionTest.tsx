import type * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen, within} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Pressable as RNPressable, Text as RNText, View as RNView} from 'react-native';
import type {ValueOf} from 'type-fest';
import type * as CardUtils from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import YourSpendSection from '@pages/home/YourSpendSection';
import type * as UseYourSpendDataModule from '@pages/home/YourSpendSection/useYourSpendData';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/useYourSpendData';
import ROUTES from '@src/ROUTES';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

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
        getDisplayableThirdPartyCards: jest.fn(() => []),
        getCardDescription: jest.fn(() => 'Card description'),
    };
});

// Mock `CardFeedIcon` so tests can introspect which branch the row picked.
// `isExpensifyCardFeed` is exposed as a testID suffix; `selectedFeed` is rendered
// as a separate testID for the third-party branches.
jest.mock('@components/CardFeedIcon', () => {
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    function MockCardFeedIcon({isExpensifyCardFeed, selectedFeed}: {isExpensifyCardFeed?: boolean; selectedFeed?: string}) {
        if (isExpensifyCardFeed) {
            return <View testID="card-feed-icon-expensify" />;
        }
        return <View testID={`card-feed-icon-feed-${selectedFeed ?? 'unknown'}`} />;
    }
    return MockCardFeedIcon;
});

// Mock `RemainingLimitCircle` so tests can assert its absence on third-party rows.
jest.mock('@pages/home/YourSpendSection/RemainingLimitCircle', () => {
    const {View} = jest.requireActual<{View: typeof RNView}>('react-native');
    function MockRemainingLimitCircle() {
        return <View testID="remaining-limit-circle" />;
    }
    return MockRemainingLimitCircle;
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

type MockCardRow = {
    cardID: number;
    query: string;
    lastFour: string;
    total: number | undefined;
    currency: string | undefined;
    spentFraction?: number | undefined;
    kind?: 'expensify' | 'thirdParty';
    bank?: CardFeedWithNumber;
    fundID?: string | undefined;
};

type MockHookData = {
    approvalRowState: ValueOf<typeof YOUR_SPEND_ROW_STATE>;
    approvalTotals: {total: number | undefined; currency: string | undefined};
    paymentRowState: ValueOf<typeof YOUR_SPEND_ROW_STATE>;
    paymentTotals: {total: number | undefined; currency: string | undefined};
    cardRows: MockCardRow[];
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

describe('YourSpendSection — third-party rows', () => {
    const THIRD_PARTY_CARD_ID = 901;
    const THIRD_PARTY_BANK = 'vcf' as CardFeedWithNumber;
    const THIRD_PARTY_QUERY = `type:expense from:1 cardID:${THIRD_PARTY_CARD_ID}`;

    function thirdPartyRow(overrides: Partial<MockCardRow> = {}): MockCardRow {
        return {
            cardID: THIRD_PARTY_CARD_ID,
            query: THIRD_PARTY_QUERY,
            lastFour: '9876',
            total: 12300,
            currency: 'USD',
            spentFraction: undefined,
            kind: 'thirdParty',
            bank: THIRD_PARTY_BANK,
            fundID: '767578',
            ...overrides,
        };
    }

    function expensifyRow(overrides: Partial<MockCardRow> = {}): MockCardRow {
        return {
            cardID: 1,
            query: 'type:expense from:1 cardID:1',
            lastFour: '1234',
            total: 5000,
            currency: 'USD',
            spentFraction: 0.4,
            kind: 'expensify',
            bank: 'Expensify Card' as CardFeedWithNumber,
            fundID: '999',
            ...overrides,
        };
    }

    it('renders a third-party card row by testID', () => {
        mockHook({cardRows: [thirdPartyRow()]});
        render(<YourSpendSection />);
        expect(screen.getByTestId(`your-spend-card-row-${THIRD_PARTY_CARD_ID}`)).toBeOnTheScreen();
    });

    it("does not render the Expensify-card feed icon inside a third-party row's leftComponent", () => {
        mockHook({cardRows: [thirdPartyRow()]});
        render(<YourSpendSection />);
        const row = screen.getByTestId(`your-spend-card-row-${THIRD_PARTY_CARD_ID}`);
        expect(within(row).queryByTestId('card-feed-icon-expensify')).toBeNull();
    });

    it('does not render the RemainingLimitCircle for a third-party row (R-5)', () => {
        mockHook({cardRows: [thirdPartyRow({spentFraction: undefined})]});
        render(<YourSpendSection />);
        const row = screen.getByTestId(`your-spend-card-row-${THIRD_PARTY_CARD_ID}`);
        expect(within(row).queryByTestId('remaining-limit-circle')).toBeNull();
    });

    it('navigates to SEARCH_ROOT with the third-party row query when tapped (R-8)', () => {
        (Navigation.navigate as jest.Mock).mockClear();
        mockHook({cardRows: [thirdPartyRow()]});
        render(<YourSpendSection />);
        const row = screen.getByTestId(`your-spend-card-row-${THIRD_PARTY_CARD_ID}`);
        // The mock MenuItem renders as a Pressable wrapping a description Text. fireEvent.press
        // requires a Pressable target, so we press the description text inside the row.
        const description = within(row).getByText('homePage.yourSpend.recentTransactions');
        fireEvent.press(description);
        expect(Navigation.navigate).toHaveBeenLastCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: THIRD_PARTY_QUERY}));
    });

    it('renders no skeleton inside the third-party card row (R-6)', () => {
        mockHook({cardRows: [thirdPartyRow()]});
        render(<YourSpendSection />);
        const row = screen.getByTestId(`your-spend-card-row-${THIRD_PARTY_CARD_ID}`);
        // The Your spend section only renders skeletons for the approval/payment summary rows.
        // Third-party card rows must never carry a skeleton testID — assert the absence here.
        expect(within(row).queryByTestId('your-spend-approval-skeleton')).toBeNull();
        expect(within(row).queryByTestId('your-spend-payment-skeleton')).toBeNull();
    });

    it('PRD Example 4: renders only the third-party rows when approval and payment are HIDDEN and there is no Expensify Card row', () => {
        const tpRow1 = thirdPartyRow();
        const tpRow2 = thirdPartyRow({cardID: 902, query: 'type:expense from:1 cardID:902', lastFour: '5555'});
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            cardRows: [tpRow1, tpRow2],
        });
        render(<YourSpendSection />);
        expect(screen.getByTestId('your-spend-section')).toBeOnTheScreen();
        expect(screen.queryByTestId('your-spend-approval-row')).toBeNull();
        expect(screen.queryByTestId('your-spend-payment-row')).toBeNull();
        expect(screen.getByTestId(`your-spend-card-row-${tpRow1.cardID}`)).toBeOnTheScreen();
        expect(screen.getByTestId(`your-spend-card-row-${tpRow2.cardID}`)).toBeOnTheScreen();
    });

    it('R-9: section is hidden when there are zero card rows and approval/payment are HIDDEN', () => {
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            cardRows: [],
        });
        const {toJSON} = render(<YourSpendSection />);
        expect(toJSON()).toBeNull();
        expect(screen.queryByTestId('your-spend-section')).toBeNull();
    });

    it('caps visible card rows at 5 and renders the See N more toggle when more cards exist (R-7)', () => {
        // 6 mixed rows (1 Expensify + 5 third-party). With approval/payment HIDDEN the
        // visible cap is SECTION_VISIBLE_LIMIT (5), so 1 row is hidden and a See more
        // toggle is rendered. Translate is mocked to identity so the toggle label
        // surfaces as the i18n key `homePage.seeMore`.
        const rows: MockCardRow[] = [
            expensifyRow({cardID: 1001, lastFour: '0001', query: 'type:expense from:1 cardID:1001'}),
            thirdPartyRow({cardID: 2001, lastFour: '0002', query: 'type:expense from:1 cardID:2001'}),
            thirdPartyRow({cardID: 2002, lastFour: '0003', query: 'type:expense from:1 cardID:2002'}),
            thirdPartyRow({cardID: 2003, lastFour: '0004', query: 'type:expense from:1 cardID:2003'}),
            thirdPartyRow({cardID: 2004, lastFour: '0005', query: 'type:expense from:1 cardID:2004'}),
            thirdPartyRow({cardID: 2005, lastFour: '0006', query: 'type:expense from:1 cardID:2005'}),
        ];
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
            cardRows: rows,
        });
        render(<YourSpendSection />);
        expect(screen.getByTestId('your-spend-card-row-1001')).toBeOnTheScreen();
        expect(screen.getByTestId('your-spend-card-row-2001')).toBeOnTheScreen();
        expect(screen.getByTestId('your-spend-card-row-2002')).toBeOnTheScreen();
        expect(screen.getByTestId('your-spend-card-row-2003')).toBeOnTheScreen();
        expect(screen.getByTestId('your-spend-card-row-2004')).toBeOnTheScreen();
        // The 6th row is hidden (only 5 visible) until the toggle is pressed.
        expect(screen.queryByTestId('your-spend-card-row-2005')).toBeNull();
        // The See N more toggle is present.
        expect(screen.getByText('homePage.seeMore')).toBeOnTheScreen();
    });

    it('R-4 (full ordering): approval -> payment -> expensify card -> third-party card', () => {
        const expRow = expensifyRow();
        const tpRow = thirdPartyRow();
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.READY,
            paymentRowState: YOUR_SPEND_ROW_STATE.READY,
            cardRows: [expRow, tpRow],
        });
        render(<YourSpendSection />);
        const section = screen.getByTestId('your-spend-section');
        // Match approval-row, payment-row, and any card-row-* element under the section,
        // then assert their relative order in the rendered tree.
        const allRows = within(section).getAllByTestId(/^your-spend-(approval-row|payment-row|card-row-\d+)$/);
        const collectedTestIDs = allRows.map((el) => (el.props as {testID: string}).testID);
        expect(collectedTestIDs).toEqual(['your-spend-approval-row', 'your-spend-payment-row', `your-spend-card-row-${expRow.cardID}`, `your-spend-card-row-${tpRow.cardID}`]);
    });
});
