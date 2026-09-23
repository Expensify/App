import {fireEvent, render, screen} from '@testing-library/react-native';

import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import AddHomeAddress from '@src/pages/home/TimeSensitiveSection/items/AddHomeAddress';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const mockRootState: ReturnType<typeof navigationRef.getRootState> = {
    key: 'root',
    index: 0,
    routeNames: [],
    routes: [],
    type: 'stack',
    stale: false,
};

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget');

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Home: () => null,
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

describe('AddHomeAddress', () => {
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
