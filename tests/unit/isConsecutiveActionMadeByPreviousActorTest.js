"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var CONST_1 = require("@src/CONST");
var ReportTestUtils_1 = require("../utils/ReportTestUtils");
var accountID = 1;
describe('isConsecutiveActionMadeByPreviousActor', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('returns false if current action is missing', function () {
        var result = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)([(0, ReportTestUtils_1.getFakeReportAction)(accountID)], 0);
        expect(result).toBe(false);
    });
    it('returns false if actions are more than 5 minutes apart', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID, { created: '2025-01-01T02:00:00Z' }), (0, ReportTestUtils_1.getFakeReportAction)(accountID, { created: '2025-01-01T01:01:00Z' })];
        var result = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(result).toBe(false);
    });
    it('returns false if previous action is CREATED', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID), (0, ReportTestUtils_1.getFakeReportAction)(accountID, { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED })];
        var result = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(result).toBe(false);
    });
    it('returns false if either action is RENAMED', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID), (0, ReportTestUtils_1.getFakeReportAction)(accountID, { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED })];
        expect((0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0)).toBe(false);
        expect((0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions.toReversed(), 0)).toBe(false);
    });
    it('returns false if delegateAccountIDs differ', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID, { delegateAccountID: 100 }), (0, ReportTestUtils_1.getFakeReportAction)(accountID, { delegateAccountID: 101 })];
        expect((0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0)).toBe(false);
    });
    it('returns false if report preview statuses are mismatched', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID, { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW }), (0, ReportTestUtils_1.getFakeReportAction)(accountID)];
        expect((0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0)).toBe(false);
        expect((0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions.toReversed(), 0)).toBe(false);
    });
    it('returns false if the current action is SUBMITTED and the current action adminID is different than previous action actorID', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID, { adminAccountID: 3 }), (0, ReportTestUtils_1.getFakeReportAction)(2)];
        var isConsecutiveActionMadeByPreviousActor = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns false if the current action is SUBMITTED and the current action adminID is different than previous action actorID', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID, { adminAccountID: 3 }), (0, ReportTestUtils_1.getFakeReportAction)(2)];
        var isConsecutiveActionMadeByPreviousActor = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns false if the previous action is SUBMITTED and the previous action adminID is different than current action actorID', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(2, { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT }), (0, ReportTestUtils_1.getFakeReportAction)(accountID, { adminAccountID: 3 })];
        var isConsecutiveActionMadeByPreviousActor = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns false if the current action is SUBMITTED and the previous action was made by a different actor', function () {
        var actions = [(0, ReportTestUtils_1.getFakeReportAction)(accountID), (0, ReportTestUtils_1.getFakeReportAction)(2)];
        var isConsecutiveActionMadeByPreviousActor = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns true if the current action is SUBMITTED and the previous action was made by the same actor', function () {
        var actions = [
            (0, ReportTestUtils_1.getFakeReportAction)(accountID, { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT }),
            (0, ReportTestUtils_1.getFakeReportAction)(accountID, { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT }),
        ];
        var isConsecutiveActionMadeByPreviousActor = (0, ReportActionsUtils_1.isConsecutiveActionMadeByPreviousActor)(actions, 0);
        expect(isConsecutiveActionMadeByPreviousActor).toBe(true);
    });
});
