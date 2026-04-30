/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import useHasAnyAdminExpensifyCardFeed from '@hooks/useHasAnyAdminExpensifyCardFeed';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const policyID = 'policy_workspace';

const mockUseOnyx = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]): [unknown, {status?: string}] => mockUseOnyx(...args) as [unknown, {status?: string}],
}));

function cardSettingsKey(fundID: number) {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`;
}

describe('useHasAnyAdminExpensifyCardFeed', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [{}, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });
    });

    it('returns false when there are no card settings', () => {
        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(false);
    });

    it('returns false when settings are not considered loaded (only one key)', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(1)]: {preferredPolicy: policyID},
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [
                    {
                        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {role: CONST.POLICY.ROLE.ADMIN},
                    },
                    {status: 'loaded'},
                ];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(false);
    });

    it('returns false when preferredPolicy is missing', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(1)]: {isEnabled: true, isLoading: false},
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [
                    {
                        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {role: CONST.POLICY.ROLE.ADMIN},
                    },
                    {status: 'loaded'},
                ];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(false);
    });

    it('returns false when user is not policy admin', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(1)]: {preferredPolicy: policyID, isEnabled: true},
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [
                    {
                        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {role: CONST.POLICY.ROLE.USER},
                    },
                    {status: 'loaded'},
                ];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(false);
    });

    it('returns true when at least one admin-visible Expensify Card feed exists', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(99)]: {preferredPolicy: policyID, isEnabled: true},
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [
                    {
                        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {role: CONST.POLICY.ROLE.ADMIN},
                    },
                    {status: 'loaded'},
                ];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(true);
    });

    it('returns true when feed uses linkedPolicyIDs and user is admin of a linked workspace (no preferredPolicy)', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(42)]: {linkedPolicyIDs: [policyID], isEnabled: true},
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [
                    {
                        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {role: CONST.POLICY.ROLE.ADMIN},
                    },
                    {status: 'loaded'},
                ];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(true);
    });
});
