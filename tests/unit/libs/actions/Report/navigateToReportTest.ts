import {navigateToReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    navigate: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

describe('navigateToReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('defers navigating to the report until dismissModal signals the transition has settled', () => {
        navigateToReport('123');

        // The navigation to the report must be sequenced through dismissModal's afterTransition callback
        // instead of firing independently, otherwise a slower dismissal can finish afterward and clobber it.
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        const dismissModalArgs = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0) as {afterTransition?: () => void} | undefined;
        const afterTransition = dismissModalArgs?.afterTransition;
        expect(afterTransition).toBeInstanceOf(Function);

        // Must not navigate before the dismiss transition has actually settled.
        expect(Navigation.navigate).not.toHaveBeenCalled();

        afterTransition?.();

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });
});
