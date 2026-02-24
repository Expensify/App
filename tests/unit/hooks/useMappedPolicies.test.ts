import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useMappedPolicies from '@hooks/useMappedPolicies';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';

function buildPolicy(id: number, overrides: Partial<Policy>): Policy {
    return {
        ...createRandomPolicy(id, CONST.POLICY.TYPE.TEAM),
        pendingAction: undefined,
        ...overrides,
    };
}

const nameMapper = (policy: OnyxEntry<Policy>) => policy?.name;

describe('useMappedPolicies', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('applies the mapper to each policy', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPolicy(1, {name: 'Alpha'}));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}2`, buildPolicy(2, {name: 'Beta'}));

        const {result} = renderHook(() => useMappedPolicies(nameMapper));

        await waitFor(() => {
            const [policies] = result.current;
            expect(policies[`${ONYXKEYS.COLLECTION.POLICY}1`]).toBe('Alpha');
            expect(policies[`${ONYXKEYS.COLLECTION.POLICY}2`]).toBe('Beta');
        });
    });

    it('returns empty object when no policies exist', async () => {
        const {result} = renderHook(() => useMappedPolicies(nameMapper));

        await waitFor(() => {
            const [policies] = result.current;
            expect(policies).toEqual({});
        });
    });

    it('returns metadata as the second element', async () => {
        const {result} = renderHook(() => useMappedPolicies(nameMapper));

        await waitFor(() => {
            const [, metadata] = result.current;
            expect(metadata).toBeDefined();
            expect(metadata).toHaveProperty('status');
        });
    });

    it('updates when Onyx policy data changes', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPolicy(1, {name: 'Original'}));

        const {result} = renderHook(() => useMappedPolicies(nameMapper));

        await waitFor(() => {
            expect(result.current[0][`${ONYXKEYS.COLLECTION.POLICY}1`]).toBe('Original');
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {name: 'Updated'});

        await waitFor(() => {
            expect(result.current[0][`${ONYXKEYS.COLLECTION.POLICY}1`]).toBe('Updated');
        });
    });

    it('handles mapper that extracts multiple fields', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPolicy(1, {name: 'Workspace', type: CONST.POLICY.TYPE.TEAM}));

        const multiFieldMapper = (policy: OnyxEntry<Policy>) => policy && {name: policy.name, type: policy.type};
        const {result} = renderHook(() => useMappedPolicies(multiFieldMapper));

        await waitFor(() => {
            const mapped = result.current[0][`${ONYXKEYS.COLLECTION.POLICY}1`];
            expect(mapped).toEqual({name: 'Workspace', type: CONST.POLICY.TYPE.TEAM});
        });
    });
});
