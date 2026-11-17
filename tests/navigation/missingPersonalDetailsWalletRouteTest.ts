/** Wallet setup must not turn into shipping or reveal when navigation serializes its routes. */
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

describe('Wallet personal-details routes', () => {
    it.each([
        [DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.getRoute('123', undefined, undefined, 'attempt'), DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.path],
        [DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.getRoute('123', 'address', 'edit', 'attempt'), DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.path],
        [DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE.getRoute('123', 'attempt'), DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE.path],
    ])('preserves the wallet purpose through %s', (suffix, pattern) => {
        // Given collection, editing, or verification opened from Wallet.
        const path = createDynamicRoute(suffix, ROUTES.SETTINGS_WALLET);

        // When the navigation state is serialized and the suffix is removed for back navigation.
        const serializedPath = getPathFromState(getStateFromPath(path));
        const backPath = stripDynamicRouteSuffixFromPath(path, pattern);

        // Then wallet purpose survives serialization without leaking onto the underlying screen.
        expect(serializedPath).toContain('walletEnrollmentID=attempt');
        expect(backPath).toBe(ROUTES.SETTINGS_WALLET);
    });
});
