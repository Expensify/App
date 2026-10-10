import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const SUFFIX = DYNAMIC_ROUTES.ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE.path;

describe('Enable payments confirm validate code dynamic route', () => {
    it('is reachable only from the IOU pay flow screens', () => {
        // Given the dynamic route that opens the wallet validateCode screen on top of the IOU pay flow
        // When reading which screens may open it
        // Then only the pay flow screens are allowed, so the Settings wallet flow keeps its own static route
        expect(DYNAMIC_ROUTES.ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE.entryScreens).toEqual([SCREENS.IOU_SEND.ENABLE_PAYMENTS, SCREENS.ENABLE_PAYMENTS_ROOT]);
    });

    it.each([ROUTES.ENABLE_PAYMENTS, ROUTES.IOU_SEND_ENABLE_PAYMENTS])('returns to the pay flow page %s once the suffix is stripped', (basePath) => {
        // Given the validateCode screen opened on top of a pay flow page
        const route = createDynamicRoute(SUFFIX, basePath);
        expect(route).toBe(`${basePath}/${SUFFIX}`);

        // When computing the back path from the current URL
        const match = findAllMatchingDynamicSuffixes(route).find((m) => m.pattern === SUFFIX);
        expect(match).toBeDefined();
        if (!match) {
            return;
        }
        const backPath = getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);

        // Then going back lands on the same pay flow page, which renders the next wallet step itself
        expect(backPath).toBe(basePath);
    });
});
