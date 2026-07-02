import {resolveEarlyReportID} from '@libs/IOUUtils';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

describe('resolveEarlyReportID', () => {
    it('returns workspace chat reportID for workspace participants', () => {
        const participants: Participant[] = [{accountID: 0, reportID: 'workspace-chat-123', isPolicyExpenseChat: true, selected: true}];

        expect(resolveEarlyReportID(true, participants)).toBe('workspace-chat-123');
    });

    it('returns UNREPORTED_REPORT_ID for selfDM participants', () => {
        const participants: Participant[] = [{accountID: 0, reportID: 'self-dm-456', isSelfDM: true, selected: true}];

        expect(resolveEarlyReportID(true, participants)).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
    });

    it('returns undefined when not from global create', () => {
        const participants: Participant[] = [{accountID: 0, reportID: 'some-report', selected: true}];

        expect(resolveEarlyReportID(false, participants)).toBeUndefined();
    });

    it('returns undefined when participants array is empty', () => {
        expect(resolveEarlyReportID(true, [])).toBeUndefined();
    });

    it('returns undefined when participants is undefined', () => {
        expect(resolveEarlyReportID(true, undefined)).toBeUndefined();
    });

    it('returns undefined when first participant has no reportID and is not selfDM', () => {
        const participants: Participant[] = [{accountID: 123, selected: true}];

        expect(resolveEarlyReportID(true, participants)).toBeUndefined();
    });

    it('uses first participant only, ignores subsequent ones', () => {
        const participants: Participant[] = [
            {accountID: 0, reportID: 'first-report', isPolicyExpenseChat: true, selected: true},
            {accountID: 0, reportID: 'second-report', isPolicyExpenseChat: true, selected: true},
        ];

        expect(resolveEarlyReportID(true, participants)).toBe('first-report');
    });
});
