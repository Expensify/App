import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import useIOUUtils from '@src/hooks/useIOUUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('useIOUUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    describe('shouldStartLocationPermissionFlow', () => {
        const now = new Date();
        const daysAgo = (days: number) => {
            const d = new Date(now);
            d.setDate(d.getDate() - days);
            return d.toISOString();
        };

        it('returns true when lastLocationPermissionPrompt is undefined', async () => {
            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(true);
        });

        it('returns true when lastLocationPermissionPrompt is null', async () => {
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, null);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(true);
        });

        it('returns true when lastLocationPermissionPrompt is empty string', async () => {
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, '');
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(true);
        });

        it('returns false when lastLocationPermissionPrompt is a valid date string within threshold', async () => {
            const recentDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS - 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, recentDate);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(false);
        });

        it('returns true when lastLocationPermissionPrompt is a valid date string outside threshold', async () => {
            const oldDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS + 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, oldDate);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(true);
        });

        it('returns false when lastLocationPermissionPrompt is an invalid date string', async () => {
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, 'not-a-date');
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(false);
        });

        it('returns false when lastLocationPermissionPrompt is exactly at threshold', async () => {
            const thresholdDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, thresholdDate);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(false);
        });

        it('reacts to changes in lastLocationPermissionPrompt', async () => {
            const {result} = renderHook(() => useIOUUtils());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(true);

            const recentDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS - 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, recentDate);
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(false);

            const oldDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS + 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, oldDate);
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow()).toBe(true);
        });
    });
});
