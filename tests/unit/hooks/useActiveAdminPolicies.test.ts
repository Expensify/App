import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useActiveAdminPolicies from '@hooks/useActiveAdminPolicies';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TEST_LOGIN = 'admin@expensify.com';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({login: TEST_LOGIN})),
}));

function buildPolicy(id: number, overrides: Partial<Policy>): Policy {
    return {
        ...createRandomPolicy(id, CONST.POLICY.TYPE.TEAM),
        pendingAction: undefined,
        ...overrides,
    };
}

describe('useActiveAdminPolicies', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns admin policies from Onyx', async () => {
        const adminPolicy = buildPolicy(1, {name: 'Admin Workspace', role: CONST.POLICY.ROLE.ADMIN});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, adminPolicy);

        const {result} = renderHook(() => useActiveAdminPolicies());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });
        expect(result.current.at(0)?.name).toBe('Admin Workspace');
    });

    it('excludes non-admin policies', async () => {
        const adminPolicy = buildPolicy(1, {name: 'Admin', role: CONST.POLICY.ROLE.ADMIN});
        const userPolicy = buildPolicy(2, {name: 'User', role: CONST.POLICY.ROLE.USER});

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, adminPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}2`, userPolicy);

        const {result} = renderHook(() => useActiveAdminPolicies());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });
        expect(result.current.at(0)?.name).toBe('Admin');
    });

    it('excludes personal policies', async () => {
        const personalPolicy = buildPolicy(1, {name: 'Personal', role: CONST.POLICY.ROLE.ADMIN, type: CONST.POLICY.TYPE.PERSONAL});
        const teamPolicy = buildPolicy(2, {name: 'Team', role: CONST.POLICY.ROLE.ADMIN});

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, personalPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}2`, teamPolicy);

        const {result} = renderHook(() => useActiveAdminPolicies());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });
        expect(result.current.at(0)?.name).toBe('Team');
    });

    it('returns empty array when no policies exist', async () => {
        const {result} = renderHook(() => useActiveAdminPolicies());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });
    });

    it('updates when Onyx policy data changes', async () => {
        const policy1 = buildPolicy(1, {name: 'First', role: CONST.POLICY.ROLE.ADMIN});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy1);

        const {result} = renderHook(() => useActiveAdminPolicies());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        const policy2 = buildPolicy(2, {name: 'Second', role: CONST.POLICY.ROLE.ADMIN});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}2`, policy2);

        await waitFor(() => {
            expect(result.current).toHaveLength(2);
        });
    });
});
