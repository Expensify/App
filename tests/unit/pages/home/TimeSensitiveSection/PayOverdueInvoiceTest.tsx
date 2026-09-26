import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import PayOverdueInvoice from '@src/pages/home/TimeSensitiveSection/items/PayOverdueInvoice';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

// Renders the interpolated date beside the key, so a test can assert the date the component built without loading translations.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, parameters?: {date?: string}) => (parameters?.date ? `${key}:${parameters.date}` : key)),
        preferredLocale: 'en',
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        InvoiceGeneric: () => null,
    })),
}));

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

describe('PayOverdueInvoice', () => {
    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('directs the billing owner to the Spend page filtered to invoices when Review is pressed', () => {
        render(<PayOverdueInvoice gracePeriodEndUnixSeconds={1789481242} />);

        fireEvent.press(screen.getByText('homePage.timeSensitiveSection.payOverdueInvoice.cta'));

        const expectedQuery = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.INVOICE});
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: expectedQuery}));
    });

    it('shows the grace-period title while within the grace period', () => {
        // Given an account still inside its grace period
        // When the card renders
        render(<PayOverdueInvoice gracePeriodEndUnixSeconds={1789481242} />);

        // Then it names the deadline rather than the past-due state, and the deadline reads as a sentence does, with
        // the month spelled out and the day anchored in UTC so no reader sees the day before
        expect(screen.getByText('homePage.timeSensitiveSection.payOverdueInvoice.dueSoonTitle:September 15, 2026')).toBeOnTheScreen();
        expect(screen.queryByText('homePage.timeSensitiveSection.payOverdueInvoice.overdueTitle')).not.toBeOnTheScreen();
    });

    it('shows the past-due title once the grace period has expired', () => {
        render(
            <PayOverdueInvoice
                gracePeriodEndUnixSeconds={1789481242}
                isOverdue
            />,
        );

        expect(screen.getByText('homePage.timeSensitiveSection.payOverdueInvoice.overdueTitle')).toBeOnTheScreen();
        expect(screen.queryByText('homePage.timeSensitiveSection.payOverdueInvoice.dueSoonTitle')).not.toBeOnTheScreen();
    });
});
