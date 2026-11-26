import getBiggestChangesGroupByOptions from '@pages/Insights/details/getBiggestChangesGroupByOptions';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const ADMIN_LOGIN = 'admin@example.com';

/** Returns a group workspace with the given members, where the admin login is an admin. */
function buildPolicy(memberLogins: string[]): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
        role: CONST.POLICY.ROLE.ADMIN,
        employeeList: Object.fromEntries(memberLogins.map((email) => [email, {email, role: email === ADMIN_LOGIN ? CONST.POLICY.ROLE.ADMIN : CONST.POLICY.ROLE.USER}])),
    };
}

describe('getBiggestChangesGroupByOptions', () => {
    it('offers Members to someone who can see Top spenders', () => {
        // Given an admin of a workspace with two members, who sees Top spenders
        const policies = [buildPolicy([ADMIN_LOGIN, 'member@example.com'])];

        // When the Biggest changes options are built
        const options = getBiggestChangesGroupByOptions(policies, ADMIN_LOGIN);

        // Then Members is offered after Categories and Merchants
        expect(options).toEqual([CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.GROUP_BY.MERCHANT, CONST.SEARCH.GROUP_BY.FROM]);
    });

    it('leaves Members out on a workspace with a single member', () => {
        // Given a workspace with only the admin, where Top spenders isn't shown
        const policies = [buildPolicy([ADMIN_LOGIN])];

        // When the Biggest changes options are built
        const options = getBiggestChangesGroupByOptions(policies, ADMIN_LOGIN);

        // Then only Categories and Merchants are offered, so no member data is shown
        expect(options).toEqual([CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.GROUP_BY.MERCHANT]);
    });
});
