import navigateToWiseGlobalReimbursements from '@libs/Navigation/helpers/navigateToWiseGlobalReimbursements';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

// Runs the callback right away, as if the intro had finished opening
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn((_route: string, options?: {afterTransition?: () => void}) => options?.afterTransition?.()),
}));

const INTRO_ROUTE = 'r/123/global-reimbursements/456' as Route;

describe('navigateToWiseGlobalReimbursements', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('opens only the intro when there is no onboarding to continue', () => {
        // Given a bank account whose onboarding has not started
        // When an entry point opens global reimbursements over a report
        navigateToWiseGlobalReimbursements(INTRO_ROUTE, false, {skipMatchingFullScreenRoute: true});

        // Then the intro opens, so the admin starts with Get started
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(INTRO_ROUTE, {skipMatchingFullScreenRoute: true});
    });

    it('opens the onboarding on top of the intro when it can continue', () => {
        // Given a bank account whose onboarding the admin left before Submit
        // When an entry point opens global reimbursements over a report
        navigateToWiseGlobalReimbursements(INTRO_ROUTE, true, {skipMatchingFullScreenRoute: true});

        // Then the intro opens first, since the onboarding takes its bank account and back path from the intro, and once it is open the onboarding
        // opens without a page, so it reopens on the first one left unanswered
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, INTRO_ROUTE, expect.objectContaining({skipMatchingFullScreenRoute: true}));
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, 'r/123/global-reimbursements/456/business-onboarding');
    });
});
