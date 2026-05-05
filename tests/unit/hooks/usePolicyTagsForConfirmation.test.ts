import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePolicyTagsForConfirmation from '@components/MoneyRequestConfirmationList/hooks/usePolicyTagsForConfirmation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const policyID = 'POLICY_TAGS_TEST';

describe('usePolicyTagsForConfirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('returns policyTags from Onyx and derives an ordered tag-list array', async () => {
        const tags: PolicyTagLists = {
            Project: {
                name: 'Project',
                required: false,
                tags: {Alpha: {name: 'Alpha', enabled: true}},
                orderWeight: 1,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, tags);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePolicyTagsForConfirmation(policyID));
        await waitFor(() => expect(result.current.policyTags).toBeDefined());
        expect(result.current.policyTags?.Project.name).toBe('Project');
        expect(Array.isArray(result.current.policyTagLists)).toBe(true);
        expect(result.current.policyTagLists.length).toBe(1);
        expect(result.current.policyTagLists.at(0)?.name).toBe('Project');
    });

    it('returns empty tag list when policy tags are missing', async () => {
        const {result} = renderHook(() => usePolicyTagsForConfirmation(policyID));
        await waitForBatchedUpdatesWithAct();
        expect(result.current.policyTags).toBeUndefined();
        expect(result.current.policyTagLists).toEqual([]);
    });
});
