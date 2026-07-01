import {act, renderHook} from '@testing-library/react-native';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportActionsVisibility from '@hooks/useReportActionsVisibility';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';
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
