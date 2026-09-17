import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useReportActionsVisibility from '@hooks/useReportActionsVisibility';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import type {ReactNode} from 'react';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {getFakeReportAction} from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Guards that `useReportActionsVisibility` subscribes to VISIBLE_REPORT_ACTIONS scoped to its own
 * report via `reportVisibleActionsSelector`. The test renders the real hook and counts how often a
 * consumer re-renders: with the per-report selector, an unrelated report's activity must not
 * re-render this report's consumer.
 */

const REPORT_A = 'reportA';
const REPORT_B = 'reportB';

/** Build a deterministic, visible ADD_COMMENT action keyed by its reportActionID. */
function buildVisibleComment(reportActionID: string) {
    return getFakeReportAction(1, {reportActionID, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
}

function buildActions(...reportActionIDs: string[]): ReportActions {
    return Object.fromEntries(reportActionIDs.map((id) => [id, buildVisibleComment(id)]));
}

/** Build an ADD_COMMENT action whispered to specific accounts (visible only to those accounts). */
function buildWhisperedComment(reportActionID: string, whisperedTo: number[]) {
    return getFakeReportAction(1, {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        message: [{html: 'hey', isDeletedParentAction: false, isEdited: false, text: 'test', type: 'COMMENT', whisperedTo}],
        originalMessage: {whisperedTo},
    });
}

function setReportActions(reportID: string, actions: ReportActions) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, actions);
}

type HookProps = Parameters<typeof useReportActionsVisibility>[0];

function buildHookProps(reportID: string, actions: ReportActions): HookProps {
    const actionsArray = Object.values(actions);
    return {
        reportID,
        reportActions: actionsArray,
        allReportActions: actionsArray,
        canPerformWriteAction: true,
        hasOlderActions: false,
        loadOlderChats: jest.fn(),
    };
}

const wrapper = ({children}: {children: ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

describe('useReportActionsVisibility scopes VISIBLE_REPORT_ACTIONS per report', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.clear();
        TestHelper.signInWithTestUser(1, 'test@test.com');
        await waitForBatchedUpdates();
    });

    it('does not re-render the open report (A) when an unrelated report (B) actions change', async () => {
        // Given reports A and B both have visible actions in the derived value, and the hook is mounted for A
        await setReportActions(REPORT_A, buildActions('a1', 'a2'));
        await setReportActions(REPORT_B, buildActions('b1'));
        await waitForBatchedUpdates();

        let renders = 0;
        const {unmount} = renderHook(
            () => {
                renders++;
                return useReportActionsVisibility(buildHookProps(REPORT_A, buildActions('a1', 'a2')));
            },
            {wrapper},
        );
        await waitForBatchedUpdates();

        const rendersBefore = renders;

        // When a new action is added to the unrelated report B
        await act(async () => {
            await setReportActions(REPORT_B, buildActions('b2'));
            await waitForBatchedUpdates();
        });

        // Then the hook for report A does not re-render.
        // (With a whole-collection subscription, report B's write would re-render A here.)
        expect(renders).toBe(rendersBefore);

        unmount();
    });

    it('re-renders the open report (A) when its own actions change (guards against over-scoping)', async () => {
        // Given the hook is mounted for report A
        await setReportActions(REPORT_A, buildActions('a1'));
        await waitForBatchedUpdates();

        let renders = 0;
        const {unmount} = renderHook(
            () => {
                renders++;
                return useReportActionsVisibility(buildHookProps(REPORT_A, buildActions('a1')));
            },
            {wrapper},
        );
        await waitForBatchedUpdates();

        const rendersBefore = renders;

        // When a new action is added to report A itself
        await act(async () => {
            await setReportActions(REPORT_A, buildActions('a2'));
            await waitForBatchedUpdates();
        });

        // Then the hook reacted to its own report's visibility change
        expect(renders).toBeGreaterThan(rendersBefore);

        unmount();
    });
});

describe('VISIBLE_REPORT_ACTIONS reflects deleted report actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.clear();
        TestHelper.signInWithTestUser(1, 'test@test.com');
        await waitForBatchedUpdates();
    });

    it('recomputes visibility on a session change (account switch) even when no report action changed', async () => {
        // Given report A holds a whisper targeted to account 1, and account 1 is signed in.
        // (signInWithTestUser in beforeEach signs in accountID 1.)
        await setReportActions(REPORT_A, {whisper: buildWhisperedComment('whisper', [1])});
        await waitForBatchedUpdates();

        // The whisper is visible to its target (account 1).
        const visibleAsTarget = await getOnyxValue(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
        expect(visibleAsTarget?.[REPORT_A]?.whisper).toBe(true);

        // When the session switches to a different user (account 2) without touching the report's actions
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 2});
            await waitForBatchedUpdates();
        });

        // Then the derived value is recomputed against the new user: the whisper now targets "others" and is hidden.
        // This only flips if the SESSION delta forces a recompute despite REPORT_ACTIONS being unchanged.
        const visibleAsOther = await getOnyxValue(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
        expect(visibleAsOther?.[REPORT_A]?.whisper).toBe(false);
    });

    it('drops a deleted action from the derived value via the incremental delta path', async () => {
        // Given a report with two visible actions (so the derived value has a cached entry to update incrementally)
        await setReportActions(REPORT_A, buildActions('a1', 'a2'));
        await waitForBatchedUpdates();

        const visibleBefore = await getOnyxValue(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
        expect(Object.keys(visibleBefore?.[REPORT_A] ?? {}).sort()).toEqual(['a1', 'a2']);

        // When one action is deleted (a null tombstone merge, exactly how report action deletion works)
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_A}`, {a1: null});
            await waitForBatchedUpdates();
        });

        // Then the deleted action is gone from the derived visibility map (not left stale).
        // The member-level delta no longer carries the per-action `null`, so this only passes
        // because the changed report is rebuilt from its full current action set.
        const visibleAfter = await getOnyxValue(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
        expect(Object.keys(visibleAfter?.[REPORT_A] ?? {})).toEqual(['a2']);
    });
});
