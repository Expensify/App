import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import FixEmailDelivery from '@src/pages/home/TimeSensitiveSection/items/FixEmailDelivery';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Mail: () => null,
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

describe('FixEmailDelivery', () => {
    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the email delivery failure copy', () => {
        // Given the row is rendered for a user whose email is on the suppression list
        // When it renders
        render(<FixEmailDelivery />);

        // Then it shows the failure title and subtitle
        expect(screen.getByText('homePage.timeSensitiveSection.emailDeliveryFailure.title')).toBeOnTheScreen();
        expect(screen.getByText('homePage.timeSensitiveSection.emailDeliveryFailure.subtitle')).toBeOnTheScreen();
    });

    it('navigates to the email issue RHP when Fix is pressed', () => {
        // Given the row is rendered
        render(<FixEmailDelivery />);

        // When the user presses the Fix CTA
        fireEvent.press(screen.getByText('homePage.timeSensitiveSection.ctaFix'));

        // Then it opens the email issue page
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_EMAIL_ISSUE);
    });
});
