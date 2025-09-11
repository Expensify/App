import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {buildOptimisticPolicyRecentlyUsedTags} from '@libs/actions/Policy/Tag';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, RecentlyUsedTags} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('buildOptimisticPolicyRecentlyUsedTags', () => {
    it('should return empty object when policyID is undefined', () => {
        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags: {},
            policyRecentlyUsedTags: {},
            policyID: undefined,
            transactionTags: 'tag1',
        });
        expect(result).toEqual({});
    });

    it('should return empty object when transactionTags is undefined', () => {
        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags: {},
            policyRecentlyUsedTags: {},
            policyID: 'policy123',
            transactionTags: undefined,
        });
        expect(result).toEqual({});
    });

    it('should return empty object when policyID is empty string', () => {
        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags: {},
            policyRecentlyUsedTags: {},
            policyID: '',
            transactionTags: 'tag1',
        });
        expect(result).toEqual({});
    });

    it('should return empty object when transactionTags is empty string', () => {
        const policyID = 'policy123';
        const tagListName = 'Department';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                    Marketing: {name: 'Marketing', enabled: true},
                    Sales: {name: 'Sales', enabled: true},
                },
            },
        };
        const existingRecentlyUsedTags: RecentlyUsedTags = {
            [tagListName]: ['Marketing', 'Sales'],
        };

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags,
            policyRecentlyUsedTags: existingRecentlyUsedTags,
            policyID,
            transactionTags: '',
        });
        expect(result).toEqual({});
    });

    it('should build optimistic recently used tags', () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                    Marketing: {name: 'Marketing', enabled: true},
                    Sales: {name: 'Sales', enabled: true},
                },
            },
        };

        const existingRecentlyUsedTags: RecentlyUsedTags = {
            Department: ['Marketing', 'Sales'],
        };

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags,
            policyRecentlyUsedTags: existingRecentlyUsedTags,
            policyID,
            transactionTags,
        });

        expect(result).toEqual({
            Department: ['Engineering', 'Marketing', 'Sales'],
        });
    });

    it('should handle multi-level tags', () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering:Frontend';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                    Marketing: {name: 'Marketing', enabled: true},
                },
            },
            Team: {
                name: 'Team',
                orderWeight: 1,
                required: false,
                tags: {
                    Frontend: {name: 'Frontend', enabled: true},
                    Backend: {name: 'Backend', enabled: true},
                },
            },
        };

        const existingRecentlyUsedTags: RecentlyUsedTags = {
            Department: ['Marketing'],
            Team: ['Backend', 'DevOps'],
        };

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags,
            policyRecentlyUsedTags: existingRecentlyUsedTags,
            policyID,
            transactionTags,
        });

        expect(result).toEqual({
            Department: ['Engineering', 'Marketing'],
            Team: ['Frontend', 'Backend', 'DevOps'],
        });
    });

    it('should handle missing recently used tags', () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                },
            },
        };

        const existingRecentlyUsedTags: RecentlyUsedTags = {};

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags,
            policyRecentlyUsedTags: existingRecentlyUsedTags,
            policyID,
            transactionTags,
        });

        expect(result).toEqual({
            Department: ['Engineering'],
        });
    });

    it('should prevent duplicate tags in recently used array', () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                },
            },
        };

        const existingRecentlyUsedTags: RecentlyUsedTags = {
            Department: ['Engineering', 'Marketing', 'Sales'],
        };

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags,
            policyRecentlyUsedTags: existingRecentlyUsedTags,
            policyID,
            transactionTags,
        });

        expect(result).toEqual({
            Department: ['Engineering', 'Marketing', 'Sales'],
        });
    });

    it('should handle mismatched recently used tags keys', () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering:Frontend';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                },
            },
            Team: {
                name: 'Team',
                orderWeight: 1,
                required: false,
                tags: {
                    Frontend: {name: 'Frontend', enabled: true},
                },
            },
        };

        const existingRecentlyUsedTags: RecentlyUsedTags = {
            OldDepartment: ['Marketing'],
            Team: ['Backend'],
            AnotherOldList: ['SomeTag'],
        };

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags,
            policyRecentlyUsedTags: existingRecentlyUsedTags,
            policyID,
            transactionTags,
        });

        expect(result).toEqual({
            Department: ['Engineering'],
            Team: ['Frontend', 'Backend'],
        });
    });

    it('should handle empty policy tags', () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering';

        const result = buildOptimisticPolicyRecentlyUsedTags({
            policyTags: {},
            policyRecentlyUsedTags: {},
            policyID,
            transactionTags,
        });

        expect(result).toEqual({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '': ['Engineering'],
        });
    });
});

describe('buildOptimisticPolicyRecentlyUsedTags - Integration with useOnyx', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should work with useOnyx data integration', async () => {
        const policyID = 'policy123';
        const transactionTags = 'Engineering';

        const policyTags: PolicyTagLists = {
            Department: {
                name: 'Department',
                orderWeight: 0,
                required: false,
                tags: {
                    Engineering: {name: 'Engineering', enabled: true},
                    Marketing: {name: 'Marketing', enabled: true},
                    Sales: {name: 'Sales', enabled: true},
                },
            },
        };

        const existingRecentlyUsedTags: RecentlyUsedTags = {
            Department: ['Marketing', 'Sales'],
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, policyTags);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, existingRecentlyUsedTags);
        await waitForBatchedUpdates();

        // Create a test hook that uses useOnyx to get data and build optimistic tags
        function useTestHook() {
            const [policyTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
            const [policyRecentlyUsedTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);

            return buildOptimisticPolicyRecentlyUsedTags({
                policyTags: policyTagsFromOnyx ?? {},
                policyRecentlyUsedTags: policyRecentlyUsedTagsFromOnyx ?? {},
                policyID,
                transactionTags,
            });
        }

        // Render the hook and wait for Onyx data to load
        const {result} = renderHook(() => useTestHook());

        await waitFor(() => {
            expect(result.current).toEqual({
                Department: ['Engineering', 'Marketing', 'Sales'],
            });
        });
    });
});
