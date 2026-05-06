import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import HomePage from '@pages/home/HomePage';
import YourSpendSection from '@pages/home/YourSpendSection';
import {useYourSpendData, YOUR_SPEND_ROW_STATE} from '@pages/home/YourSpendSection/useYourSpendData';
import ROUTES from '@src/ROUTES';

// Mocks
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
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false, isSmallScreenWidth: false})));

// Mock the data hook so YourSpendSection renders deterministically
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@pages/home/YourSpendSection/useYourSpendData', () => ({
    ...jest.requireActual('@pages/home/YourSpendSection/useYourSpendData'),
    useYourSpendData: jest.fn(() => ({
        approvalRowState: 'loading',
        paymentRowState: 'loading',
        cardRows: [],
        awaitingApprovalQuery: '',
        repaidLast30DaysQuery: '',
    })),
}));

// Helpers
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
        // The skeleton row should be visible during loading
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

describe('HomePage — YourSpendSection present in both layouts', () => {
    const mockUseResponsiveLayout = jest.requireMock<{
        default: jest.Mock;
    }>('@hooks/useResponsiveLayout').default;

    beforeEach(() => {
        jest.clearAllMocks();
        mockHook({
            approvalRowState: YOUR_SPEND_ROW_STATE.LOADING,
            paymentRowState: YOUR_SPEND_ROW_STATE.LOADING,
        });
    });

    it('renders YourSpendSection in narrow layout', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true, isSmallScreenWidth: true});
        render(<HomePage />);
        // YourSpendSection should be rendered; AssignedCardsSection should not
        expect(screen.getByTestId('your-spend-section')).toBeOnTheScreen();
    });

    it('renders YourSpendSection in wide layout', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false, isSmallScreenWidth: false});
        render(<HomePage />);
        expect(screen.getByTestId('your-spend-section')).toBeOnTheScreen();
    });

    it('does not render AssignedCardsSection in narrow layout after migration', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true, isSmallScreenWidth: true});
        render(<HomePage />);
        // If AssignedCardsSection is still present, the migration is incomplete
        expect(screen.queryByTestId('assigned-cards-section')).toBeNull();
    });

    it('does not render AssignedCardsSection in wide layout after migration', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false, isSmallScreenWidth: false});
        render(<HomePage />);
        expect(screen.queryByTestId('assigned-cards-section')).toBeNull();
    });
});
