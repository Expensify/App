import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePolicyCategoriesForConfirmation from '@components/MoneyRequestConfirmationList/hooks/usePolicyCategoriesForConfirmation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const policyID = 'POLICY_FOR_CONFIRMATION';

describe('usePolicyCategoriesForConfirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('returns real policy categories when set', async () => {
        const real: PolicyCategories = {Food: {name: 'Food', enabled: true, areCommentsRequired: false, externalID: '', origin: ''}};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, real);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePolicyCategoriesForConfirmation(policyID));
        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.Food.name).toBe('Food');
    });

    it('falls back to draft policy categories when real is missing', async () => {
        const draft: PolicyCategories = {Travel: {name: 'Travel', enabled: true, areCommentsRequired: false, externalID: '', origin: ''}};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`, draft);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePolicyCategoriesForConfirmation(policyID));
        await waitFor(() => expect(result.current).toBeDefined());
        expect(result.current?.Travel.name).toBe('Travel');
    });

    it('prefers real over draft when both are set', async () => {
        const real: PolicyCategories = {Food: {name: 'Food', enabled: true, areCommentsRequired: false, externalID: '', origin: ''}};
        const draft: PolicyCategories = {Travel: {name: 'Travel', enabled: true, areCommentsRequired: false, externalID: '', origin: ''}};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, real);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`, draft);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePolicyCategoriesForConfirmation(policyID));
        await waitFor(() => expect(result.current?.Food).toBeDefined());
        expect(result.current?.Food.name).toBe('Food');
        expect(result.current?.Travel).toBeUndefined();
    });

    it('returns undefined when neither real nor draft are set', async () => {
        const {result} = renderHook(() => usePolicyCategoriesForConfirmation(policyID));
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });
});
