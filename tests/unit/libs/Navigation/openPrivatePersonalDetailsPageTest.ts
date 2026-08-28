import openPrivatePersonalDetailsPage from '@libs/Navigation/helpers/openPrivatePersonalDetailsPage';
import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget');

describe('openPrivatePersonalDetailsPage', () => {
    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(swapBackgroundTabForRHPTarget).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('swaps the background tab before opening private personal details', () => {
        const rootState = {routes: []};
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(rootState);

        openPrivatePersonalDetailsPage(INPUT_IDS.ADDRESS_LINE_1);

        expect(swapBackgroundTabForRHPTarget).toHaveBeenCalledWith(rootState, ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
    });
});
