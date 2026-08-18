import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

/**
 * The confirm workspace form always renders the currency row, and that row opens the `currency`
 * dynamic route appended to whichever screen is hosting the form. A host missing from
 * `entryScreens` fails validation in getStateFromPath, so the user lands on Not Found instead of
 * the currency selector. Regression guard for #94530.
 */
describe('WORKSPACE_CONFIRMATION_CURRENCY', () => {
    const currencyEntryScreens: readonly string[] = DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_CURRENCY.entryScreens;

    it('allows opening the currency selector from every screen that hosts the confirm workspace form', () => {
        expect(currencyEntryScreens).toEqual(
            expect.arrayContaining([SCREENS.WORKSPACE_CONFIRMATION.DYNAMIC_ROOT, SCREENS.TRAVEL.DYNAMIC_WORKSPACE_CONFIRMATION, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_UPGRADE]),
        );
    });

    it('allows every host that the plan type row allows', () => {
        // Both rows sit on the same form, and the currency row is the one that renders for every
        // user, so any screen that can open the plan type selector must be able to open this one.
        const planTypeEntryScreens: readonly string[] = DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_PLAN_TYPE.entryScreens;
        expect(currencyEntryScreens).toEqual(expect.arrayContaining([...planTypeEntryScreens]));
    });
});
