import openHomeAddressPage, {openHomeAddressPageWithFocus} from '@libs/Navigation/helpers/openHomeAddressPage';
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
        runAfterUpcomingTransition: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget');

describe('openHomeAddressPage', () => {
    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(swapBackgroundTabForRHPTarget).mockClear();
        jest.mocked(Navigation.runAfterUpcomingTransition).mockClear();
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
        expect(swapBackgroundTabForRHPTarget).toHaveBeenCalledWith(mockRootState, ROUTES.SETTINGS_HOME_ADDRESS.getRoute());
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HOME_ADDRESS.getRoute());
        expect(Navigation.runAfterUpcomingTransition).not.toHaveBeenCalled();
    });

    it('waits for the background tab transition before opening the link destination with focus', () => {
        // Given opening the link needs to switch from a chat to Preferences
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(mockRootState);
        jest.mocked(swapBackgroundTabForRHPTarget).mockReturnValue(true);

        // When the home address link requests focus
        openHomeAddressPageWithFocus();

        // Then the form is not mounted until the tab can no longer steal focus and validate the empty field
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.runAfterUpcomingTransition).toHaveBeenCalledTimes(1);
        jest.mocked(Navigation.runAfterUpcomingTransition).mock.calls.at(0)?.[0]();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HOME_ADDRESS.getRoute('addressLine1'));
    });

    it('opens the link destination immediately when the background tab does not change', () => {
        // Given Preferences is already behind the RHP
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(mockRootState);
        jest.mocked(swapBackgroundTabForRHPTarget).mockReturnValue(false);

        // When the home address link requests focus
        openHomeAddressPageWithFocus();

        // Then there is no tab transition to wait for
        expect(Navigation.runAfterUpcomingTransition).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HOME_ADDRESS.getRoute('addressLine1'));
    });
});
