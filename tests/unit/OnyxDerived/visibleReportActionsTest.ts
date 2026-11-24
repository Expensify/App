import visibleReportActionsConfig from '@libs/actions/OnyxDerived/configs/visibleReportActions';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection} from 'react-native-onyx';

describe('visibleReportActions', () => {
    describe('SESSION detected via triggeredKeys', () => {
        const reportActionsKeyA = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}A`;
        // Only report A has report actions now; report B exists only in the previous derived value (currentValue).
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKeyA]: {}};
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [allReportActions, undefined, {} as OnyxCollection<Report>, {} as OnyxCollection<ReportNameValuePairs>, {}];
        const currentValue: VisibleReportActionsDerivedValue = {A: {}, B: {}};
        const sourceValues: Parameters<typeof visibleReportActionsConfig.compute>[1]['sourceValues'] = {[ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {[reportActionsKeyA]: {}}};

        it('recomputes incrementally (keeps a stale report) when only report actions triggered', () => {
            const result = visibleReportActionsConfig.compute(args, {currentValue, sourceValues, triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_ACTIONS])});

            // Incremental: report B (absent from allReportActions) is retained from the previous value.
            expect(result.B).toBeDefined();
        });

        it('does a full recompute (drops the stale report) when SESSION also triggered, even with no SESSION delta', () => {
            const result = visibleReportActionsConfig.compute(args, {currentValue, sourceValues, triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION])});

            // Full recompute: report B is not in allReportActions, so it is dropped.
            expect(result.B).toBeUndefined();
            expect(result.A).toBeDefined();
        });
    });

    it('hides a support survey when the ticket has been replaced', () => {
        // Given a support survey that was visible before the replacement ticket arrived
        const reportID = 'supportTicketReportID';
        const surveyActionID = 'surveyActionID';
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
        const unrelatedReportID = 'unrelatedReportID';
        const unrelatedActionID = 'unrelatedActionID';
        const unrelatedReportKey = `${ONYXKEYS.COLLECTION.REPORT}${unrelatedReportID}`;
        const unrelatedReportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${unrelatedReportID}`;
        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: {
                [surveyActionID]: {
                    reportActionID: surveyActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY,
                    created: '2026-10-13 12:00:00.000',
                },
            },
        };
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [
            allReportActions,
            undefined,
            {[reportKey]: {reportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET}, [unrelatedReportKey]: {reportID: unrelatedReportID, type: CONST.REPORT.TYPE.CHAT}},
            {[reportNameValuePairsKey]: {reopenedAsReportID: 'replacementReportID'}},
            {},
        ];
        const currentValue: VisibleReportActionsDerivedValue = {
            [reportID]: {[surveyActionID]: true},
            [unrelatedReportID]: {[unrelatedActionID]: true},
        };

        // When the replacement and an unrelated report NVP trigger a recompute
        const result = visibleReportActionsConfig.compute(args, {
            currentValue,
            sourceValues: {
                [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {
                    [reportNameValuePairsKey]: {reopenedAsReportID: 'replacementReportID'},
                    [unrelatedReportNameValuePairsKey]: {agentZeroProcessingRequestIndicator: 'processing'},
                },
            },
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]),
        });

        // Then the shared visibility state hides the stale survey without recomputing unrelated reports
        expect(result[reportID]?.[surveyActionID]).toBe(false);
        expect(result[unrelatedReportID]).toBe(currentValue[unrelatedReportID]);
    });

    it('recomputes only the changed report when a report changes', () => {
        // Given a closed report that turned into a support ticket, where the closed action shows only for support tickets
        const reportID = 'ticketReportID';
        const closedActionID = 'closedActionID';
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const unrelatedReportID = 'unrelatedReportID';
        const ticketReport = {reportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET};
        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: {
                [closedActionID]: {
                    reportActionID: closedActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    created: '2026-11-11 12:00:00.000',
                },
            },
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${unrelatedReportID}`]: {},
        };
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [allReportActions, undefined, {[reportKey]: ticketReport}, {}, {}];
        const currentValue: VisibleReportActionsDerivedValue = {
            [reportID]: {[closedActionID]: false},
            [unrelatedReportID]: {},
        };

        // When only the report triggers a recompute
        const result = visibleReportActionsConfig.compute(args, {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: ticketReport}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // Then the closed action shows, and the unrelated report keeps its previous value because it was not recomputed
        expect(result[reportID]?.[closedActionID]).toBe(true);
        expect(result[unrelatedReportID]).toBe(currentValue[unrelatedReportID]);
    });

    it('returns the previous value when a report write changes no visibility', () => {
        // Given a chat whose only comment is visible
        const reportID = 'chatReportID';
        const commentID = 'commentID';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const chatReport = {reportID, type: CONST.REPORT.TYPE.CHAT, lastReadTime: '2026-11-11 12:00:00.000'};
        const allReportActions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: {
                [commentID]: {
                    reportActionID: commentID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2026-11-11 11:00:00.000',
                    message: [{type: 'COMMENT', html: 'Hello', text: 'Hello'}],
                },
            },
        };
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [allReportActions, undefined, {[reportKey]: chatReport}, {}, {}];
        const currentValue = visibleReportActionsConfig.compute(args, {currentValue: undefined, sourceValues: undefined, triggeredKeys: new Set<OnyxKey>()});

        // When reading the chat writes a new lastReadTime, which changes no action's visibility
        const readReport = {...chatReport, lastReadTime: '2026-11-11 12:05:00.000'};
        const result = visibleReportActionsConfig.compute([allReportActions, undefined, {[reportKey]: readReport}, {}, {}], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: readReport}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // Then the derived value is the same object, so Onyx skips the write and notifies no subscriber
        expect(result).toBe(currentValue);
    });

    it('does not check the actions again when a report write leaves its support ticket state unchanged', () => {
        // Given a chat whose visibility was computed
        const reportID = 'readChatReportID';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const chatReport = {reportID, type: CONST.REPORT.TYPE.CHAT, lastReadTime: '2026-11-11 12:00:00.000'};
        const allReportActions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: {
                commentID: {
                    reportActionID: 'commentID',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2026-11-11 11:00:00.000',
                    message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}],
                },
            },
        };
        const currentValue = visibleReportActionsConfig.compute([allReportActions, undefined, {[reportKey]: chatReport}, {}, {}], {
            currentValue: undefined,
            sourceValues: undefined,
            triggeredKeys: new Set<OnyxKey>(),
        });
        const visibilitySpy = jest.spyOn(ReportActionsUtils, 'shouldReportActionBeVisible');

        // When reading the chat writes a new lastReadTime
        const readReport = {...chatReport, lastReadTime: '2026-11-11 12:05:00.000'};
        const result = visibleReportActionsConfig.compute([allReportActions, undefined, {[reportKey]: readReport}, {}, {}], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: readReport}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // Then no action is checked again, because only the support ticket state of a report changes its actions' visibility
        expect(visibilitySpy).not.toHaveBeenCalled();
        expect(result).toBe(currentValue);
        visibilitySpy.mockRestore();
    });

    it('checks only the new action when a message arrives', () => {
        // Given a chat with two comments whose visibility was computed
        const reportID = 'busyChatReportID';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        const buildComment = (reportActionID: string, created: string) => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created,
            message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}],
        });
        const reports = {[reportKey]: {reportID, type: CONST.REPORT.TYPE.CHAT}};
        const firstActions: ReportActions = {first: buildComment('first', '2026-11-11 11:00:00.000'), second: buildComment('second', '2026-11-11 11:01:00.000')};
        const currentValue = visibleReportActionsConfig.compute([{[reportActionsKey]: firstActions}, undefined, reports, {}, {}], {
            currentValue: undefined,
            sourceValues: undefined,
            triggeredKeys: new Set<OnyxKey>(),
        });
        const visibilitySpy = jest.spyOn(ReportActionsUtils, 'shouldReportActionBeVisible');

        // When a third comment arrives and Onyx keeps the objects of the first two
        const nextActions: ReportActions = {...firstActions, third: buildComment('third', '2026-11-11 11:02:00.000')};
        const result = visibleReportActionsConfig.compute([{[reportActionsKey]: nextActions}, undefined, reports, {}, {}], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {[reportActionsKey]: nextActions}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_ACTIONS]),
        });

        // Then only the new comment is checked, because checking every action of a long chat on each message was the costliest derived work
        expect(visibilitySpy).toHaveBeenCalledTimes(1);
        expect(result[reportID]).toEqual({first: true, second: true, third: true});
        visibilitySpy.mockRestore();
    });

    it('recomputes room creation whisper visibility when the policy role changes', () => {
        // Given a report with an actionable report mention whisper that was visible while the user was a regular member
        const reportID = 'policyReportID';
        const policyID = 'policy1';
        const whisperActionID = 'whisperActionID';
        const deletedWhisperActionID = 'deletedWhisperActionID';
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
        const policyReportWithoutWhisperID = 'policyReportWithoutWhisperID';
        const unrelatedReportID = 'unrelatedReportID';

        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: {
                [whisperActionID]: {
                    reportActionID: whisperActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER,
                    created: '2026-11-11 12:00:00.000',
                    message: [{type: 'COMMENT', html: 'Create room?', text: 'Create room?'}],
                },
                [deletedWhisperActionID]: {
                    reportActionID: deletedWhisperActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER,
                    created: '2026-11-11 12:01:00.000',
                    message: [],
                },
            },
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReportWithoutWhisperID}`]: {
                comment1: {
                    reportActionID: 'comment1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2026-11-11 12:02:00.000',
                    message: [{type: 'COMMENT', html: 'Hello', text: 'Hello'}],
                },
            },
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${unrelatedReportID}`]: {},
        };

        const approveOnlyPolicy: Policy = {
            id: policyID,
            name: 'Control Policy',
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.APPROVE_ONLY,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
        };
        const memberPolicy: Policy = {
            ...approveOnlyPolicy,
            role: CONST.POLICY.ROLE.USER,
        };

        const currentValue: VisibleReportActionsDerivedValue = {
            [reportID]: {[whisperActionID]: true, [deletedWhisperActionID]: false},
            [policyReportWithoutWhisperID]: {comment1: true},
            [unrelatedReportID]: {},
        };

        const allReports: OnyxCollection<Report> = {
            [reportKey]: {reportID, policyID},
            [`${ONYXKEYS.COLLECTION.REPORT}${policyReportWithoutWhisperID}`]: {reportID: policyReportWithoutWhisperID, policyID},
        };

        // When the policy role changes to approve-only and triggers an incremental recompute
        const demotedResult = visibleReportActionsConfig.compute([allReportActions, {accountID: 1, email: 'member@test.com'}, allReports, {}, {[policyKey]: approveOnlyPolicy}], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: approveOnlyPolicy}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        // Then the whisper is hidden on the report that has one, while reports without room whispers keep their cached object reference
        expect(demotedResult[reportID]?.[whisperActionID]).toBe(false);
        expect(demotedResult[policyReportWithoutWhisperID]).toBe(currentValue[policyReportWithoutWhisperID]);
        expect(demotedResult[unrelatedReportID]).toBe(currentValue[unrelatedReportID]);

        // When the policy role is promoted back to member, the live whisper shows while the deleted whisper stays hidden
        const promotedResult = visibleReportActionsConfig.compute([allReportActions, {accountID: 1, email: 'member@test.com'}, allReports, {}, {[policyKey]: memberPolicy}], {
            currentValue: demotedResult,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: memberPolicy}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.POLICY]),
        });

        expect(promotedResult[reportID]?.[whisperActionID]).toBe(true);
        expect(promotedResult[reportID]?.[deletedWhisperActionID]).toBe(false);
        expect(promotedResult[policyReportWithoutWhisperID]).toBe(currentValue[policyReportWithoutWhisperID]);
    });

    it('checks room creation whispers again when a report moves to another policy', () => {
        // Given a room creation whisper that shows while its report belongs to a policy where the user is a member
        const reportID = 'movedReportID';
        const whisperActionID = 'movedWhisperActionID';
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const memberPolicy: Policy = {
            id: 'memberPolicy',
            name: 'Member Policy',
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.USER,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
        };
        const approveOnlyPolicy: Policy = {...memberPolicy, id: 'approveOnlyPolicy', role: CONST.POLICY.ROLE.APPROVE_ONLY};
        const allPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${memberPolicy.id}`]: memberPolicy, [`${ONYXKEYS.COLLECTION.POLICY}${approveOnlyPolicy.id}`]: approveOnlyPolicy};
        const allReportActions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: {
                [whisperActionID]: {
                    reportActionID: whisperActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER,
                    created: '2026-11-11 12:00:00.000',
                    message: [{type: 'COMMENT', html: 'Create room?', text: 'Create room?'}],
                },
            },
        };
        const session = {accountID: 1, email: 'member@test.com'};
        const report = {reportID, policyID: memberPolicy.id};
        const currentValue = visibleReportActionsConfig.compute([allReportActions, session, {[reportKey]: report}, {}, allPolicies], {
            currentValue: undefined,
            sourceValues: undefined,
            triggeredKeys: new Set<OnyxKey>(),
        });
        expect(currentValue[reportID]?.[whisperActionID]).toBe(true);

        // When the report moves to a policy where the user is approve-only, a report write that changes no support ticket state
        const movedReport = {...report, policyID: approveOnlyPolicy.id};
        const result = visibleReportActionsConfig.compute([allReportActions, session, {[reportKey]: movedReport}, {}, allPolicies], {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: movedReport}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // Then the whisper is checked against the new policy and hides, because only users who can create rooms there see it
        expect(result[reportID]?.[whisperActionID]).toBe(false);
    });
});
