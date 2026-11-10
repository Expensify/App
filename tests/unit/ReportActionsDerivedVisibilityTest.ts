import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('derived report-action visibility', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1});
        await waitForBatchedUpdates();
    });

    it('recomputes whisper eligibility when the signed-in account changes', async () => {
        // Given a persisted whisper targeted to account 1
        const whisper = {
            created: '2026-11-01 00:01:00.000',
            reportActionID: 'whisper',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            message: {type: 'COMMENT', html: 'Private', text: 'Private', whisperedTo: [1]},
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, {whisper});
        await waitForBatchedUpdates();
        expect((await Onyx.get(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS))?.['1']?.whisper).toBe(true);
        // When a different account signs in without an action update
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 2});
        await waitForBatchedUpdates();
        // Then cached visibility reflects the new recipient rather than stale session data
        expect((await Onyx.get(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS))?.['1']?.whisper).toBe(false);
    });

    it('removes deleted actions from the incremental visibility cache', async () => {
        // Given two cached visible comments
        const actions: ReportActions = Object.fromEntries(['a1', 'a2'].map((id) => [id, getFakeReportAction(1, {reportActionID: id, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})]));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, actions);
        await waitForBatchedUpdates();
        // When an action is deleted with a null tombstone
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, {a1: null});
        await waitForBatchedUpdates();
        // Then the derived map does not retain its old entry
        expect(Object.keys((await Onyx.get(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS))?.['1'] ?? {})).toEqual(['a2']);
    });
});
