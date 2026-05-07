import {fireEvent, render, screen} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import React from 'react';
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
// unit test. Replace it with a passthrough that still mounts left/right/title content so the
// outer testIDs and inner Button (in `rightComponent`) remain interactive.
jest.mock('@components/MenuItemWithTopDescription', () => {
    function MockMenuItemWithTopDescription({title, rightComponent, leftComponent}: {title?: string; rightComponent?: ReactNode; leftComponent?: ReactNode}) {
        return (
            <>
                {leftComponent}
                {title}
                {rightComponent}
            </>
        );
    }
    return MockMenuItemWithTopDescription;
});

jest.mock('@pages/home/YourSpendSection/useYourSpendData', () => {
    const actual: typeof UseYourSpendDataModule = jest.requireActual('@pages/home/YourSpendSection/useYourSpendData');
    return {
        ...actual,
        useYourSpendData: jest.fn(() => ({
            approvalRowState: 'loading',
            paymentRowState: 'loading',
            cardRows: [],
            awaitingApprovalQuery: '',
            repaidLast30DaysQuery: '',
        })),
    };
});

type MockHookData = {
    approvalRowState: string;
    paymentRowState: string;
    cardRows: Array<{cardID: number; query: string; lastFour: string}>;
    awaitingApprovalQuery: string;
    repaidLast30DaysQuery: string;
};

function mockHook(data: Partial<MockHookData>) {
    (useYourSpendData as jest.Mock).mockReturnValue({
        approvalRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
        paymentRowState: YOUR_SPEND_ROW_STATE.HIDDEN,
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

    it('navigates to SEARCH_ROOT when the approval row View button is tapped', () => {
        const approvalQuery = 'type:expense status:outstanding from:12345 reimbursable:yes';
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.READY,
            awaitingApprovalQuery: approvalQuery,
        });
        render(<YourSpendSection />);
        const viewButton = screen.getByTestId('your-spend-approval-row-view');
        fireEvent.press(viewButton);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: approvalQuery}));
    });

    it('renders a card row for each entry in cardRows', () => {
        mockHook({
            cardRows: [
                {cardID: 1, query: 'type:expense cardID:1', lastFour: '1234'},
                {cardID: 2, query: 'type:expense cardID:2', lastFour: '5678'},
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
