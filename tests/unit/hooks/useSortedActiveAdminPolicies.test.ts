import {renderHook} from '@testing-library/react-native';
import useSortedActiveAdminPolicies from '@hooks/useSortedActiveAdminPolicies';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';

const mockUseActiveAdminPolicies = jest.fn<Policy[], []>(() => []);

jest.mock('@hooks/useActiveAdminPolicies', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => mockUseActiveAdminPolicies(),
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    }),
}));

function buildPolicy(id: number, name: string): Policy {
    return {
        ...createRandomPolicy(id, CONST.POLICY.TYPE.TEAM),
        name,
        role: CONST.POLICY.ROLE.ADMIN,
        pendingAction: undefined,
    };
}

describe('useSortedActiveAdminPolicies', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns policies sorted by name', () => {
        mockUseActiveAdminPolicies.mockReturnValue([buildPolicy(1, 'Zebra'), buildPolicy(2, 'Alpha'), buildPolicy(3, 'Middle')]);

        const {result} = renderHook(() => useSortedActiveAdminPolicies());

        expect(result.current.map((p) => p.name)).toEqual(['Alpha', 'Middle', 'Zebra']);
    });

    it('returns empty array when no admin policies', () => {
        mockUseActiveAdminPolicies.mockReturnValue([]);

        const {result} = renderHook(() => useSortedActiveAdminPolicies());

        expect(result.current).toEqual([]);
    });

    it('re-sorts when underlying data changes', () => {
        mockUseActiveAdminPolicies.mockReturnValue([buildPolicy(1, 'Beta'), buildPolicy(2, 'Alpha')]);

        const {result, rerender} = renderHook(() => useSortedActiveAdminPolicies());

        expect(result.current.map((p) => p.name)).toEqual(['Alpha', 'Beta']);

        mockUseActiveAdminPolicies.mockReturnValue([buildPolicy(1, 'Beta'), buildPolicy(2, 'Alpha'), buildPolicy(3, 'Aardvark')]);
        rerender({});

        expect(result.current.map((p) => p.name)).toEqual(['Aardvark', 'Alpha', 'Beta']);
    });
});
