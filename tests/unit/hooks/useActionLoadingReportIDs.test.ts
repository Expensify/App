import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import ONYXKEYS from '@src/ONYXKEYS';
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]));
        });
    });

    it('should not include report IDs where isActionLoading is false', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, {isActionLoading: false});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set());
        });
    });

    it('should return multiple report IDs when multiple reports are loading', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, {isActionLoading: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}2`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, `${ONYXKEYS.COLLECTION.REPORT_METADATA}2`]));
        });
    });

    it('should only include report IDs where isActionLoading is true when mixed', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, {isActionLoading: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}2`, {isActionLoading: false});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}3`, {isActionLoading: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, `${ONYXKEYS.COLLECTION.REPORT_METADATA}3`]));
        });
    });

    it('should update reactively when isActionLoading changes', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, {isActionLoading: false});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useActionLoadingReportIDs());

        await waitFor(() => {
            expect(result.current).toEqual(new Set());
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`, {isActionLoading: true});
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toEqual(new Set([`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]));
        });
    });
});
