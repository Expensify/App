import type {TText} from 'react-native-render-html';
import {getReportMentionDetails} from '@libs/MentionUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

describe('MentionUtils', () => {
    describe('getReportMentionDetails', () => {
        it('should return the room report ID', () => {
            const reportID = '1';
            const mentionDetails = getReportMentionDetails(
                '',
                {policyID: '1'} as Report,
                {[reportID]: {reportID, reportName: '#hello', policyID: '1', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}},
                {data: '#hello'} as TText,
            );
            expect(mentionDetails?.reportID).toBe(reportID);
        });
        it('should return undefined report ID when the report is not a room', () => {
            const reportID = '1';
            const mentionDetails = getReportMentionDetails('', {policyID: '1'} as Report, {[reportID]: {reportID, reportName: '#hello', policyID: '1'}}, {data: '#hello'} as TText);
            expect(mentionDetails?.reportID).toBeUndefined();
        });
    });
});
