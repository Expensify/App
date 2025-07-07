"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MentionUtils_1 = require("@libs/MentionUtils");
var CONST_1 = require("@src/CONST");
describe('MentionUtils', function () {
    describe('getReportMentionDetails', function () {
        it('should return the room report ID', function () {
            var _a;
            var reportID = '1';
            var mentionDetails = (0, MentionUtils_1.getReportMentionDetails)('', { policyID: '1' }, (_a = {}, _a[reportID] = { reportID: reportID, reportName: '#hello', policyID: '1', chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM }, _a), { data: '#hello' });
            expect(mentionDetails === null || mentionDetails === void 0 ? void 0 : mentionDetails.reportID).toBe(reportID);
        });
        it('should return undefined report ID when the report is not a room', function () {
            var _a;
            var reportID = '1';
            var mentionDetails = (0, MentionUtils_1.getReportMentionDetails)('', { policyID: '1' }, (_a = {}, _a[reportID] = { reportID: reportID, reportName: '#hello', policyID: '1' }, _a), { data: '#hello' });
            expect(mentionDetails === null || mentionDetails === void 0 ? void 0 : mentionDetails.reportID).toBeUndefined();
        });
    });
});
