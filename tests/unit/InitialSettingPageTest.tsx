import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const switchToExpensifyClassic = (shouldOpenBookACall: boolean) => {
    if (shouldOpenBookACall) {
        Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVERY_BOOK_CALL.route);
        return;
    }
    Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route);
};

describe('Test switch to Expensify Classic flow', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Should navigate to BookACall page if shouldOpenBookACall is true', () => {
        switchToExpensifyClassic(true);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_EXIT_SURVERY_BOOK_CALL.route);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('Should navigate to Confirm page if shouldOpenBookACall is false', () => {
        switchToExpensifyClassic(false);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });
});
