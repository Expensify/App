import {renderHook} from '@testing-library/react-native';
import useHasAnyAdminExpensifyCardFeed from '@hooks/useHasAnyAdminExpensifyCardFeed';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const policyID = 'policy_workspace';
const currentUserAccountID = 1001;
const orphanDomainFundID = 5555;

const mockUseOnyx = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]): [unknown, {status?: string}] => mockUseOnyx(...args) as [unknown, {status?: string}],
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: currentUserAccountID}),
}));

function cardSettingsKey(fundID: number) {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`;
}

function domainWithAdmin(fundID: number, accountID: number) {
    return {
        [`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`]: {
            [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: accountID,
        },
    };
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
            if (key === ONYXKEYS.COLLECTION.DOMAIN) {
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

    it('returns false when preferredPolicy is missing and user is not domain admin', () => {
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
            if (key === ONYXKEYS.COLLECTION.DOMAIN) {
                return [{}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(false);
    });

    it('returns true when preferredPolicy is missing but user is domain admin of the feed', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(orphanDomainFundID)]: {
                            domainName: 'example.com',
                            isEnabled: true,
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{}, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.COLLECTION.DOMAIN) {
                return [domainWithAdmin(orphanDomainFundID, currentUserAccountID), {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useHasAnyAdminExpensifyCardFeed());

        expect(result.current).toBe(true);
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
