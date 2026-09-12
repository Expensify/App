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

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key), dateFnsLocale: undefined})));

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
});
