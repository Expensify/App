import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import ROUTES from '@src/ROUTES';

// Regression guard for https://github.com/Expensify/Expensify/issues/654289.
// The domain "Force two-factor authentication" confirmation route must not end in the reserved
// `two-factor-auth` dynamic suffix, otherwise navigation to it is hijacked by the global personal
// 2FA dynamic route (TWO_FACTOR_AUTH_ROOT) and the domain disable flow never runs.
describe('domain force-2FA route dynamic-suffix collision', () => {
    it('does not collide with any dynamic route suffix', () => {
        const domainRoute = ROUTES.DOMAIN_MEMBERS_SETTINGS_TWO_FACTOR_AUTH.getRoute(123);

        expect(findAllMatchingDynamicSuffixes(domainRoute)).toEqual([]);
    });

    it('documents the collision that the rename fixes', () => {
        const collidingRoute = 'domain/123/members/settings/two-factor-auth';

        expect(findAllMatchingDynamicSuffixes(collidingRoute).some((match) => match.pattern === 'two-factor-auth')).toBe(true);
    });
});
