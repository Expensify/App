import {renderHook, waitFor} from '@testing-library/react-native';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useActionLoadingReportIDs', () => {
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

    it('should return an empty set when no report metadata exists', () => {
        const {result} = renderHook(() => useActionLoadingReportIDs());

        expect(result.current).toEqual(new Set());
    });

    it('should return a set containing a report ID when isActionLoading is true', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`]));
        });
    });

    it('should not include report IDs where isActionLoading is false', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: false});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set());
        });
    });

    it('should return multiple report IDs when multiple reports are loading', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}2`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}2`]));
        });
    });

    it('should only include report IDs where isActionLoading is true when mixed', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}2`, {isActionLoading: false});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}3`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}3`]));
        });
    });

    it('should update reactively when isActionLoading changes', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: false});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set());
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: true});
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`]));
        });
    });

    it('should keep the same set when only another loading flag changes', async () => {
        // Given a report whose actions are loading
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}1`]));
        });
        const initialSet = result.current;

        // When OpenReport toggles a different flag on another report
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}2`, {isLoadingInitialReportActions: true});
        await waitForBatchedUpdates();

        // Then Search gets the same set back, so it doesn't rebuild every row
        expect(result.current).toBe(initialSet);
    });
});
