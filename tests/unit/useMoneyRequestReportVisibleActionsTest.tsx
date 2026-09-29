import {act, renderHook} from '@testing-library/react-native';

import useMoneyRequestReportVisibleActions from '@components/MoneyRequestReportView/useMoneyRequestReportVisibleActions';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import {getFakeReportAction} from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = 'report1';
const TRANSACTION_ID = 'transaction1';

type Params = Parameters<typeof useMoneyRequestReportVisibleActions>[0];

const wrapper = ({children}: {children: ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

/** A plain comment, which the money request report always renders. */
function buildComment(reportActionID: string, overrides: Partial<ReportAction> = {}): ReportAction {
    return getFakeReportAction(Number(reportActionID), {
        reportActionID,
        reportID: REPORT_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        ...overrides,
    });
}

function buildIOUAction(reportActionID: string, type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>, IOUTransactionID: string): ReportAction {
    return getFakeReportAction(1, {
        reportActionID,
        reportID: REPORT_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {
            type,
            IOUTransactionID,
            IOUReportID: REPORT_ID,
            amount: 100,
            currency: CONST.CURRENCY.USD,
        },
    });
}

/** The hook reads the paginated chain newest-first, the same way `MoneyRequestReportActionsList` feeds it. */
function buildParams(reportActions: ReportAction[], overrides: Partial<Params> = {}): Params {
    return {
        reportID: REPORT_ID,
        reportActions,
        reportTransactionIDs: [TRANSACTION_ID],
        canPerformWriteAction: true,
        shouldShowHarvestCreatedAction: false,
        isOffline: false,
        ...overrides,
    };
}

/** Push the same actions into Onyx so the VISIBLE_REPORT_ACTIONS derived value the hook subscribes to is populated. */
function setReportActions(reportActions: ReportAction[]) {
    const actions: ReportActions = Object.fromEntries(reportActions.map((action) => [action.reportActionID, action]));
    return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, actions);
}

async function renderWithActions(reportActions: ReportAction[], overrides: Partial<Params> = {}) {
    await setReportActions(reportActions);
    await waitForBatchedUpdates();

    const {result} = renderHook(() => useMoneyRequestReportVisibleActions(buildParams(reportActions, overrides)), {wrapper});
    await act(async () => {
        await waitForBatchedUpdates();
    });

    return result;
}

function getVisibleIDs(actions: ReportAction[]) {
    return actions.map((action) => action.reportActionID);
}

describe('useMoneyRequestReportVisibleActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.clear();
        TestHelper.signInWithTestUser(1, 'test@test.com');
        await waitForBatchedUpdates();
    });

    it('should return the visible actions in both orderings', async () => {
        // Given a chain of three comments, newest-first
        const actions = [buildComment('3'), buildComment('2'), buildComment('1')];

        const result = await renderWithActions(actions);

        // Then the newest-first ordering is preserved and the list ordering is reversed for the non-inverted list
        expect(getVisibleIDs(result.current.visibleReportActionsNewestFirst)).toEqual(['3', '2', '1']);
        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['1', '2', '3']);
    });

    it('should expose the newest visible action as lastAction', async () => {
        const actions = [buildComment('3'), buildComment('2'), buildComment('1')];

        const result = await renderWithActions(actions);

        expect(result.current.lastAction?.reportActionID).toBe('3');
    });

    it('should return no lastAction when nothing is visible', async () => {
        // Given a chain that only holds the CREATED action, which this view hides by default
        const actions = [buildComment('1', {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED})];

        const result = await renderWithActions(actions);

        expect(result.current.visibleReportActions).toEqual([]);
        expect(result.current.lastAction).toBeUndefined();
    });

    it('should hide the CREATED action by default', async () => {
        const actions = [buildComment('2'), buildComment('1', {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED})];

        const result = await renderWithActions(actions);

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['2']);
    });

    it('should show the CREATED action when the harvested expense needs it', async () => {
        const actions = [buildComment('2'), buildComment('1', {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED})];

        const result = await renderWithActions(actions, {shouldShowHarvestCreatedAction: true});

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['1', '2']);
    });

    it('should hide IOU create actions, because the expenses are rendered in their own list', async () => {
        const actions = [buildComment('2'), buildIOUAction('1', CONST.IOU.REPORT_ACTION_TYPE.CREATE, TRANSACTION_ID)];

        const result = await renderWithActions(actions);

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['2']);
    });

    it('should hide an IOU action whose transaction is no longer on the report', async () => {
        const actions = [buildComment('2'), buildIOUAction('1', CONST.IOU.REPORT_ACTION_TYPE.APPROVE, 'someOtherTransaction')];

        const result = await renderWithActions(actions);

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['2']);
    });

    it('should keep an IOU action whose transaction is still on the report', async () => {
        const actions = [buildComment('2'), buildIOUAction('1', CONST.IOU.REPORT_ACTION_TYPE.APPROVE, TRANSACTION_ID)];

        const result = await renderWithActions(actions);

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['1', '2']);
    });

    it('should hide an action pending deletion while online', async () => {
        const actions = [buildComment('2'), buildComment('1', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})];

        const result = await renderWithActions(actions);

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['2']);
    });

    it('should keep an action pending deletion while offline, because the delete has not been sent yet', async () => {
        const actions = [buildComment('2'), buildComment('1', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})];

        const result = await renderWithActions(actions, {isOffline: true});

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['1', '2']);
    });

    it('should keep an action pending deletion that failed, so the error stays reachable', async () => {
        const actions = [buildComment('2'), buildComment('1', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: {error1: 'Whoops'}})];

        const result = await renderWithActions(actions);

        expect(getVisibleIDs(result.current.visibleReportActions)).toEqual(['1', '2']);
    });

    it('should report the second-oldest action of the full chain as the first visible action ID', async () => {
        const actions = [buildComment('3'), buildComment('2'), buildComment('1')];

        const result = await renderWithActions(actions);

        expect(result.current.firstVisibleReportActionID).toBe('2');
    });

    it('should report no first visible action ID when the chain holds a single action', async () => {
        const actions = [buildComment('1')];

        const result = await renderWithActions(actions);

        expect(result.current.firstVisibleReportActionID).toBeUndefined();
    });
});
