import getReportHistorySteps from '@pages/ReportHistoryPage/getReportHistorySteps';

import CONST from '@src/CONST';
import type {ReportAction, ReportActions, ReportMetadata} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type {ReportUpcomingStep} from '@src/types/onyx/ReportUpcomingSteps';

import {translateLocal} from '../utils/TestHelper';

const REPORT_ID = '1';
const OWNER_ACCOUNT_ID = 1;
const FIRST_APPROVER_ACCOUNT_ID = 2;
const SECOND_APPROVER_ACCOUNT_ID = 3;
const PAYER_ACCOUNT_ID = 4;

function buildAction(reportActionID: string, actionName: ReportAction['actionName'], actorAccountID: number, created: string, pendingAction?: ReportAction['pendingAction']): ReportAction {
    return {
        reportActionID,
        actionName,
        actorAccountID,
        created,
        pendingAction,
        message: [{type: 'COMMENT', html: actionName, text: actionName}],
    };
}

function toReportActions(actions: ReportAction[]): ReportActions {
    return Object.fromEntries(actions.map((action) => [action.reportActionID, action]));
}

function buildNextStep(messageKey: ReportNextStep['messageKey'], actorAccountID?: number): ReportNextStep {
    return {messageKey, icon: CONST.NEXT_STEP.ICONS.HOURGLASS, actorAccountID};
}

const SUBMITTED_ACTION = buildAction('2', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, OWNER_ACCOUNT_ID, '2026-01-01 10:00:00.000');

const SNAPSHOT: ReportUpcomingStep[] = [
    {action: CONST.REPORT.UPCOMING_STEP_ACTION.APPROVE, actorAccountID: FIRST_APPROVER_ACCOUNT_ID},
    {action: CONST.REPORT.UPCOMING_STEP_ACTION.APPROVE, actorAccountID: SECOND_APPROVER_ACCOUNT_ID},
    {action: CONST.REPORT.UPCOMING_STEP_ACTION.PAY, actorAccountID: PAYER_ACCOUNT_ID},
];

type ReportState = {
    isOpenReport?: boolean;
    isDEWPolicy?: boolean;
    shouldDisplayMarkAsDone?: boolean;
    reportMetadata?: ReportMetadata;
};

function getUpcoming(
    reportActions: ReportAction[],
    upcomingSteps: ReportUpcomingStep[],
    nextStep: ReportNextStep | undefined,
    {isOpenReport = false, isDEWPolicy = false, shouldDisplayMarkAsDone = false, reportMetadata}: ReportState = {},
) {
    return getReportHistorySteps({
        translate: translateLocal,
        dateFnsLocale: undefined,
        currentUserEmail: undefined,
        currentUserAccountID: FIRST_APPROVER_ACCOUNT_ID,
        reportID: REPORT_ID,
        reportOwnerAccountID: OWNER_ACCOUNT_ID,
        reportActions: toReportActions(reportActions),
        upcomingSteps,
        nextStep,
        isOpenReport,
        isDEWPolicy,
        shouldDisplayMarkAsDone,
        reportMetadata,
    })
        .filter((step) => step.isUpcoming)
        .map((step) => [step.label, step.accountID]);
}

function getCompletedSteps(reportActions: ReportAction[]) {
    return getReportHistorySteps({
        translate: translateLocal,
        dateFnsLocale: undefined,
        currentUserEmail: undefined,
        currentUserAccountID: FIRST_APPROVER_ACCOUNT_ID,
        reportID: REPORT_ID,
        reportOwnerAccountID: OWNER_ACCOUNT_ID,
        reportActions: toReportActions(reportActions),
        upcomingSteps: [],
        nextStep: undefined,
        isOpenReport: false,
        isDEWPolicy: false,
        shouldDisplayMarkAsDone: false,
        reportMetadata: undefined,
    })
        .filter((step) => !step.isUpcoming)
        .map((step) => [step.label, step.accountID]);
}

describe('getReportHistorySteps', () => {
    it.each([
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED, undefined],
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD],
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, undefined],
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD],
        [CONST.REPORT.ACTIONS.TYPE.CLOSED, undefined],
        [CONST.REPORT.ACTIONS.TYPE.CLOSED, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD],
    ])('labels a Mark as done action %s with pending state %s correctly', (actionName, pendingAction) => {
        // Given a track-intent user marking a report done in a workflow that submits to themselves
        const action: ReportAction = {
            ...buildAction('2', actionName, OWNER_ACCOUNT_ID, '2026-01-01 10:00:00.000', pendingAction),
            message: {type: 'COMMENT', html: actionName, text: actionName, amount: 100, currency: CONST.CURRENCY.USD},
        };

        // When history is built before or after the server confirms the action
        const steps = getReportHistorySteps({
            translate: translateLocal,
            dateFnsLocale: undefined,
            currentUserEmail: undefined,
            currentUserAccountID: OWNER_ACCOUNT_ID,
            reportID: REPORT_ID,
            reportOwnerAccountID: OWNER_ACCOUNT_ID,
            reportActions: toReportActions([action]),
            upcomingSteps: [],
            nextStep: buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION),
            isOpenReport: false,
            isDEWPolicy: false,
            shouldDisplayMarkAsDone: true,
            reportMetadata: undefined,
        });

        // Then history uses the same wording as the report conversation
        expect(steps).toEqual([expect.objectContaining({label: translateLocal('iou.markedAsDone'), accountID: OWNER_ACCOUNT_ID, isUpcoming: false})]);
    });

    it.each([
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED, false, false, false],
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, false, false, false],
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED, true, true, false],
        [CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, true, false, true],
    ])('preserves submission wording for %s with Mark as done %s, DEW %s and harvesting %s', (actionName, shouldDisplayMarkAsDone, isDEWPolicy, harvesting) => {
        // Given a normal submission, a DEW submission, or an automatic submission rather than a manual Mark as done
        const action: ReportAction = {
            ...buildAction('2', actionName, OWNER_ACCOUNT_ID, '2026-01-01 10:00:00.000'),
            message: {type: 'COMMENT', html: actionName, text: actionName, amount: 100, currency: CONST.CURRENCY.USD, harvesting},
        };

        // When history is built with the workflow context
        const steps = getReportHistorySteps({
            translate: translateLocal,
            dateFnsLocale: undefined,
            currentUserEmail: undefined,
            currentUserAccountID: OWNER_ACCOUNT_ID,
            reportID: REPORT_ID,
            reportOwnerAccountID: OWNER_ACCOUNT_ID,
            reportActions: toReportActions([action]),
            upcomingSteps: [],
            nextStep: undefined,
            isOpenReport: false,
            isDEWPolicy,
            shouldDisplayMarkAsDone,
            reportMetadata: undefined,
        });

        // Then unrelated submission flows retain their existing label
        expect(steps).toEqual([expect.objectContaining({label: translateLocal('reportHistoryPage.submitted')})]);
    });

    it('shows the backend upcoming steps when they match the next step', () => {
        // Given a report waiting on the first approver, with the snapshot still current
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE, FIRST_APPROVER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], SNAPSHOT, nextStep);

        // Then every upcoming step from the snapshot is shown
        expect(upcoming).toEqual([
            [translateLocal('reportHistoryPage.toApprove'), FIRST_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ]);
    });

    it('drops the steps before the current one after an approval the snapshot does not know about', () => {
        // Given the first approver approved offline, so the optimistic next step moved to the second approver while the snapshot did not change
        const approvedAction = buildAction('3', CONST.REPORT.ACTIONS.TYPE.APPROVED, FIRST_APPROVER_ACCOUNT_ID, '2026-01-01 11:00:00.000', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE, SECOND_APPROVER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION, approvedAction], SNAPSHOT, nextStep);

        // Then the first approver's step is gone because it is already done
        expect(upcoming).toEqual([
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ]);
    });

    it('drops the step of a queued Dynamic External Workflow approval', () => {
        // Given a Dynamic External Workflow approval made offline, which adds the approved action but leaves the next step unchanged
        const approvedAction = buildAction('3', CONST.REPORT.ACTIONS.TYPE.APPROVED, FIRST_APPROVER_ACCOUNT_ID, '2026-01-01 11:00:00.000', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE, FIRST_APPROVER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION, approvedAction], SNAPSHOT, nextStep, {
            isDEWPolicy: true,
            reportMetadata: {pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE},
        });

        // Then the approval isn't shown as both done and upcoming
        expect(upcoming).toEqual([
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ]);
    });

    it('keeps the step of an approval that a later unapprove undid', () => {
        // Given the first approver approved and then unapproved offline, so the next step is back on them
        const approvedAction = buildAction('3', CONST.REPORT.ACTIONS.TYPE.APPROVED, FIRST_APPROVER_ACCOUNT_ID, '2026-01-01 11:00:00.000', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        const unapprovedAction = buildAction('4', CONST.REPORT.ACTIONS.TYPE.UNAPPROVED, FIRST_APPROVER_ACCOUNT_ID, '2026-01-01 12:00:00.000', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE, FIRST_APPROVER_ACCOUNT_ID);

        // When the steps are built, on a regular workflow and on a Dynamic External Workflow that still has the approval queued
        const upcoming = getUpcoming([SUBMITTED_ACTION, approvedAction, unapprovedAction], SNAPSHOT, nextStep);
        const dewUpcoming = getUpcoming([SUBMITTED_ACTION, approvedAction, unapprovedAction], SNAPSHOT, nextStep, {
            isDEWPolicy: true,
            reportMetadata: {pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE},
        });

        // Then the approval is still upcoming in both cases
        const expected = [
            [translateLocal('reportHistoryPage.toApprove'), FIRST_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ];
        expect(upcoming).toEqual(expected);
        expect(dewUpcoming).toEqual(expected);
    });

    it('keeps the submit step after a submit that a later retract undid', () => {
        // Given the submitter submitted and then retracted offline, while the snapshot still starts at the submit
        const submittedAction = buildAction('2', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, OWNER_ACCOUNT_ID, '2026-01-01 10:00:00.000', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        const retractedAction = buildAction('3', CONST.REPORT.ACTIONS.TYPE.RETRACTED, OWNER_ACCOUNT_ID, '2026-01-01 11:00:00.000', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT, OWNER_ACCOUNT_ID);
        const snapshot = [{action: CONST.REPORT.UPCOMING_STEP_ACTION.SUBMIT, actorAccountID: OWNER_ACCOUNT_ID}, ...SNAPSHOT];

        // When the steps are built
        const upcoming = getUpcoming([submittedAction, retractedAction], snapshot, nextStep, {isOpenReport: true});

        // Then the submit step is still the current one
        expect(upcoming.at(0)).toEqual([translateLocal('reportHistoryPage.toSubmit'), OWNER_ACCOUNT_ID]);
    });

    it('adds the current approval when the report was unapproved after the snapshot reached the payment', () => {
        // Given the report was unapproved offline, while the snapshot only has the pay step left
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE, SECOND_APPROVER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], [{action: CONST.REPORT.UPCOMING_STEP_ACTION.PAY, actorAccountID: PAYER_ACCOUNT_ID}], nextStep);

        // Then the approval comes before the payment
        expect(upcoming).toEqual([
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ]);
    });

    it('shows only the current step when the report moved back from a finished snapshot', () => {
        // Given a paid report, whose snapshot is empty, that was retracted offline
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT, OWNER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], [], nextStep, {isOpenReport: true});

        // Then only the submit step is known until the snapshot is fetched again
        expect(upcoming).toEqual([[translateLocal('reportHistoryPage.toSubmit'), OWNER_ACCOUNT_ID]]);
    });

    it.each([
        [true, false, 'reportHistoryPage.toMarkAsDone'],
        [true, true, 'reportHistoryPage.toSubmit'],
        [false, false, 'reportHistoryPage.toSubmit'],
    ] as const)('labels the upcoming submit step with Mark as done %s and DEW %s as %s', (shouldDisplayMarkAsDone, isDEWPolicy, expectedLabel) => {
        // Given an open report waiting on its owner, in a workflow that may submit to the owner themselves
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_MARK_AS_DONE, OWNER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([], [{action: CONST.REPORT.UPCOMING_STEP_ACTION.SUBMIT, actorAccountID: OWNER_ACCOUNT_ID}], nextStep, {
            isOpenReport: true,
            isDEWPolicy,
            shouldDisplayMarkAsDone,
        });

        // Then the step uses the same wording as the report's Mark as done button
        expect(upcoming).toEqual([[translateLocal(expectedLabel), OWNER_ACCOUNT_ID]]);
    });

    it('treats fixing issues on an open report as the submit step', () => {
        // Given an open report whose violations must be fixed before it can be submitted again, and a snapshot that starts at the approval
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES, OWNER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], SNAPSHOT, nextStep, {isOpenReport: true});

        // Then the submit step comes first
        expect(upcoming.at(0)).toEqual([translateLocal('reportHistoryPage.toSubmit'), OWNER_ACCOUNT_ID]);
    });

    it('keeps the snapshot when a submitted report waits on the submitter to fix issues', () => {
        // Given a failed Dynamic External Workflow approval, which asks the submitter to fix issues while the report stays submitted
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES, OWNER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], SNAPSHOT, nextStep);

        // Then no submit step is added, because the report is still with its approvers
        expect(upcoming).toEqual([
            [translateLocal('reportHistoryPage.toApprove'), FIRST_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ]);
    });

    it('adds the current step when the report moved back a step', () => {
        // Given the submitter retracted the report offline, so the next step is to submit while the snapshot starts at the approval
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT, OWNER_ACCOUNT_ID);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], SNAPSHOT, nextStep);

        // Then the submit step comes first, followed by the rest of the workflow
        expect(upcoming).toEqual([
            [translateLocal('reportHistoryPage.toSubmit'), OWNER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toApprove'), FIRST_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toApprove'), SECOND_APPROVER_ACCOUNT_ID],
            [translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID],
        ]);
    });

    it('matches the pay step by action when the payer is an unspecified admin', () => {
        // Given the report was fully approved, and the next step names "an admin" rather than a member
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY, -1);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], SNAPSHOT, nextStep);

        // Then only the pay step remains
        expect(upcoming).toEqual([[translateLocal('reportHistoryPage.toPay'), PAYER_ACCOUNT_ID]]);
    });

    it('shows no upcoming steps when no further action is needed', () => {
        // Given a report that was paid, while the snapshot still lists the pay step
        const nextStep = buildNextStep(CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION);

        // When the steps are built
        const upcoming = getUpcoming([SUBMITTED_ACTION], SNAPSHOT, nextStep);

        // Then nothing is left to do
        expect(upcoming).toEqual([]);
    });

    it('skips upcoming actions it does not know', () => {
        // Given the backend sends an action this version of the app doesn't support
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the action is deliberately outside the known union
        const unknownStep = {action: 'export', actorAccountID: PAYER_ACCOUNT_ID} as unknown as ReportUpcomingStep;

        // When the steps are built without a next step to reconcile against
        const upcoming = getUpcoming([SUBMITTED_ACTION], [unknownStep], undefined);

        // Then the unknown step isn't shown as a pay step
        expect(upcoming).toEqual([]);
    });

    it('orders completed steps with the same timestamp the same way every time', () => {
        // Given a submit and an approval written in the same millisecond, in reverse order
        const created = '2026-01-01 10:00:00.000';
        const approvedAction = buildAction('20', CONST.REPORT.ACTIONS.TYPE.APPROVED, FIRST_APPROVER_ACCOUNT_ID, created);
        const submittedAction = buildAction('10', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, OWNER_ACCOUNT_ID, created);

        // When the steps are built
        const steps = getReportHistorySteps({
            translate: translateLocal,
            dateFnsLocale: undefined,
            currentUserEmail: undefined,
            currentUserAccountID: FIRST_APPROVER_ACCOUNT_ID,
            reportID: REPORT_ID,
            reportOwnerAccountID: OWNER_ACCOUNT_ID,
            reportActions: toReportActions([approvedAction, submittedAction]),
            upcomingSteps: [],
            nextStep: undefined,
            isOpenReport: false,
            isDEWPolicy: false,
            shouldDisplayMarkAsDone: false,
            reportMetadata: undefined,
        });

        // Then they fall back to the report action ID order, like the report itself
        expect(steps.map((step) => step.key)).toEqual(['10', '20']);
    });

    it('shows the admin as the submitter when an admin submits for the report owner', () => {
        // Given a submit action written under the owner's account by an admin, like the backend does
        const submittedAction: ReportAction = {
            ...buildAction('2', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, OWNER_ACCOUNT_ID, '2026-01-01 10:00:00.000'),
            adminAccountID: FIRST_APPROVER_ACCOUNT_ID,
        };

        // When the steps are built
        const steps = getCompletedSteps([submittedAction]);

        // Then the history credits the admin, like the report conversation does
        expect(steps).toEqual([[translateLocal('reportHistoryPage.submitted'), FIRST_APPROVER_ACCOUNT_ID]]);
    });

    it('shows Concierge as the submitter of a delayed submission', () => {
        // Given a submit action the delayed submission job made for the owner
        const submittedAction: ReportAction = {
            ...buildAction('2', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, OWNER_ACCOUNT_ID, '2026-01-01 10:00:00.000'),
            message: {type: 'COMMENT', html: 'submitted', text: 'submitted', amount: 100, currency: CONST.CURRENCY.USD, harvesting: true},
        };

        // When the steps are built
        const steps = getCompletedSteps([submittedAction]);

        // Then the history credits Concierge, like the report conversation does
        expect(steps).toEqual([[translateLocal('reportHistoryPage.submitted'), CONST.ACCOUNT_ID.CONCIERGE]]);
    });
});
