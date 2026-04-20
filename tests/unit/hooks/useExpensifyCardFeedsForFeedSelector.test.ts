/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const US_PROGRAM = CONST.COUNTRY.US;

const currentPolicyID = 'policy_current';
const otherPolicyID = 'policy_other';

const mockUseOnyx = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]): [unknown, {status?: string}] => mockUseOnyx(...args) as [unknown, {status?: string}],
}));

function adminPolicy(policyID: string) {
    return {
        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {
            role: CONST.POLICY.ROLE.ADMIN,
        },
    };
}

function cardSettingsKey(fundID: number) {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`;
}

describe('useExpensifyCardFeedsForFeedSelector', () => {
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

    it('returns empty feeds when policyID is undefined', () => {
        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(undefined));

        expect(result.current).toEqual({
            primaryFeeds: [],
            otherFeeds: [],
            allFeeds: [],
        });
    });

    it('returns empty feeds when collections are empty', () => {
        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(currentPolicyID));

        expect(result.current).toEqual({
            primaryFeeds: [],
            otherFeeds: [],
            allFeeds: [],
        });
    });

    it('partitions by preferredPolicy when no entry has linkedPolicyIDs', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(111)]: {
                            preferredPolicy: currentPolicyID,
                            isEnabled: true,
                        },
                        [cardSettingsKey(222)]: {
                            preferredPolicy: otherPolicyID,
                            isEnabled: true,
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{...adminPolicy(currentPolicyID), ...adminPolicy(otherPolicyID)}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(currentPolicyID));

        expect(result.current.allFeeds).toHaveLength(2);
        expect(result.current.primaryFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds.at(0)?.fundID).toBe(111);
        expect(result.current.otherFeeds).toHaveLength(1);
        expect(result.current.otherFeeds.at(0)?.fundID).toBe(222);
    });

    it('partitions by linkedPolicyIDs for feeds that define them (per feed, not global)', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(10)]: {
                            preferredPolicy: otherPolicyID,
                            isEnabled: true,
                            linkedPolicyIDs: [currentPolicyID],
                        },
                        [cardSettingsKey(20)]: {
                            preferredPolicy: currentPolicyID,
                            isEnabled: true,
                            linkedPolicyIDs: [otherPolicyID],
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{...adminPolicy(currentPolicyID), ...adminPolicy(otherPolicyID)}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(currentPolicyID));

        expect(result.current.primaryFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds.at(0)?.fundID).toBe(10);
        expect(result.current.otherFeeds).toHaveLength(1);
        expect(result.current.otherFeeds.at(0)?.fundID).toBe(20);
        expect(result.current.allFeeds).toHaveLength(2);
    });

    it('resolves linkedPolicyIDs nested under US (not only on settings root)', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(77)]: {
                            [US_PROGRAM]: {
                                linkedPolicyIDs: [currentPolicyID, otherPolicyID],
                                isEnabled: true,
                            },
                            hasOnceLoaded: true,
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{...adminPolicy(currentPolicyID), ...adminPolicy(otherPolicyID)}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(currentPolicyID));

        expect(result.current.allFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds.at(0)?.fundID).toBe(77);
    });

    it('resolves linkedPolicyIDs (API spelling) and matches policyID case-insensitively', () => {
        const policyIdUpper = 'BF0EEF42D8D1036B';
        const policyIdLower = policyIdUpper.toLowerCase();
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(88)]: {
                            [US_PROGRAM]: {
                                linkedPolicyIDs: [policyIdUpper, otherPolicyID],
                                isEnabled: true,
                            },
                            hasOnceLoaded: true,
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{...adminPolicy(policyIdUpper), ...adminPolicy(otherPolicyID)}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(policyIdLower));

        expect(result.current.allFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds.at(0)?.fundID).toBe(88);
    });

    it('includes feeds visible via linkedPolicyIDs when preferredPolicy is a different workspace', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(7)]: {
                            preferredPolicy: otherPolicyID,
                            isEnabled: true,
                            linkedPolicyIDs: [currentPolicyID, otherPolicyID],
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [{...adminPolicy(currentPolicyID), ...adminPolicy(otherPolicyID)}, {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(currentPolicyID));

        expect(result.current.allFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds).toHaveLength(1);
        expect(result.current.primaryFeeds.at(0)?.fundID).toBe(7);
        expect(result.current.otherFeeds).toHaveLength(0);
    });

    it('excludes feeds that are not visible to admin (single-key settings)', () => {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
                return [
                    {
                        [cardSettingsKey(1)]: {preferredPolicy: currentPolicyID},
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [adminPolicy(currentPolicyID), {status: 'loaded'}];
            }
            return [undefined, {}];
        });

        const {result} = renderHook(() => useExpensifyCardFeedsForFeedSelector(currentPolicyID));

        expect(result.current.allFeeds).toHaveLength(0);
        expect(result.current.primaryFeeds).toHaveLength(0);
        expect(result.current.otherFeeds).toHaveLength(0);
    });
});
