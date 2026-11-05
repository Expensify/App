import openHomeAddressPage from '@libs/Navigation/helpers/openHomeAddressPage';
import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

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

describe('openHomeAddressPage', () => {
    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(swapBackgroundTabForRHPTarget).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens the home address page right away, even when the preferences tab has to be swapped in first', () => {
        // Given a root state where the preferences tab has to be swapped in behind the RHP
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(mockRootState);
        jest.mocked(swapBackgroundTabForRHPTarget).mockReturnValue(true);

        // When a commuter exclusion prompt opens the home address page
        openHomeAddressPage();

        // Then the preferences tab is offered as the background, and the address form opens without waiting for that
        // swap, because the form focuses no field on open, so the tab change has no focus to take away
        expect(swapBackgroundTabForRHPTarget).toHaveBeenCalledWith(mockRootState, ROUTES.SETTINGS_HOME_ADDRESS);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HOME_ADDRESS);
    });
});
