import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID_1 = 'report_1';
const REPORT_ID_2 = 'report_2';
const REPORT_ID_3 = 'report_3';
const ARCHIVED_DATE = '2024-01-15';
const SECOND_ARCHIVED_DATE = '2024-03-22';

describe('usePrivateIsArchivedMap', () => {
    beforeEach(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('returns an empty map when no report name value pairs are set', () => {
        const {result} = renderHook(() => usePrivateIsArchivedMap());
        expect(result.current).toEqual({});
    });

    it('maps report keys to their private_isArchived values', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`, {private_isArchived: ARCHIVED_DATE});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_2}`, {private_isArchived: SECOND_ARCHIVED_DATE});
        });

        const {result} = renderHook(() => usePrivateIsArchivedMap());

        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`]).toBe(ARCHIVED_DATE);
        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_2}`]).toBe(SECOND_ARCHIVED_DATE);
    });

    it('returns undefined for reports that are not archived', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_3}`, {origin: 'email'});
        });

        const {result} = renderHook(() => usePrivateIsArchivedMap());

        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_3}`]).toBeUndefined();
    });

    it('updates the map when Onyx data changes', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`, {origin: 'email'});
        });

        const {result} = renderHook(() => usePrivateIsArchivedMap());

        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`]).toBeUndefined();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`, {private_isArchived: ARCHIVED_DATE});
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`]).toBe(ARCHIVED_DATE);
    });

    it('handles a mix of archived and non-archived reports', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`, {private_isArchived: ARCHIVED_DATE});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_2}`, {origin: 'email'});
        });

        const {result} = renderHook(() => usePrivateIsArchivedMap());

        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_1}`]).toBe(ARCHIVED_DATE);
        expect(result.current[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID_2}`]).toBeUndefined();
    });
});
