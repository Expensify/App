import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import ONYXKEYS from '@src/ONYXKEYS';

describe('useArchivedReportsIdSet', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should return an empty Set when no report name value pairs exist', async () => {
        const {result} = renderHook(() => useArchivedReportsIdSet());

        await waitFor(() => {
            expect(result.current).toBeInstanceOf(Set);
            expect(result.current.size).toBe(0);
        });
    });

    it('should return a Set containing only archived report IDs', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`, {private_isArchived: 'archived'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}456`, {private_isArchived: ''});

        const {result} = renderHook(() => useArchivedReportsIdSet());

        await waitFor(() => {
            expect(result.current.size).toBe(1);
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`)).toBe(true);
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}456`)).toBe(false);
        });
    });

    it('should return multiple archived report IDs', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}100`, {private_isArchived: 'archived'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}200`, {private_isArchived: 'archived'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}300`, {private_isArchived: ''});

        const {result} = renderHook(() => useArchivedReportsIdSet());

        await waitFor(() => {
            expect(result.current.size).toBe(2);
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}100`)).toBe(true);
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}200`)).toBe(true);
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}300`)).toBe(false);
        });
    });

    it('should update when a report becomes archived', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`, {private_isArchived: ''});

        const {result} = renderHook(() => useArchivedReportsIdSet());

        await waitFor(() => {
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`)).toBe(false);
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`, {private_isArchived: 'archived'});

        await waitFor(() => {
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`)).toBe(true);
        });
    });

    it('should handle undefined values in the collection', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`, {private_isArchived: 'archived'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}456`, null);

        const {result} = renderHook(() => useArchivedReportsIdSet());

        await waitFor(() => {
            expect(result.current.size).toBe(1);
            expect(result.current.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}123`)).toBe(true);
        });
    });
});
