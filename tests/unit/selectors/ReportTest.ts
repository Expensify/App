import {policyRoomNamesSelector} from '@selectors/Report';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

const POLICY_A = 'policy_a';
const POLICY_B = 'policy_b';

function makeReport(overrides: Partial<Report> & {reportID: string}): Report {
    return {
        reportID: overrides.reportID,
        policyID: overrides.policyID,
        reportName: overrides.reportName,
        chatType: overrides.chatType,
    };
}

describe('policyRoomNamesSelector', () => {
    it('returns empty array when reports is undefined', () => {
        expect(policyRoomNamesSelector(POLICY_A)(undefined)).toEqual([]);
    });

    it('returns empty array when reports is empty', () => {
        expect(policyRoomNamesSelector(POLICY_A)({})).toEqual([]);
    });

    it('returns room names matching the given policyID', () => {
        const reports: OnyxCollection<Report> = {
            report1: makeReport({reportID: '1', policyID: POLICY_A, reportName: '#general', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
            report2: makeReport({reportID: '2', policyID: POLICY_A, reportName: '#random', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
        };
        expect(policyRoomNamesSelector(POLICY_A)(reports)).toEqual(['#general', '#random']);
    });

    it('excludes reports with non-room chatType in the same policy', () => {
        const reports: OnyxCollection<Report> = {
            report1: makeReport({reportID: '1', policyID: POLICY_A, reportName: '#general', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
            report2: makeReport({reportID: '2', policyID: POLICY_A, reportName: 'Expense Report', chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT}),
        };
        expect(policyRoomNamesSelector(POLICY_A)(reports)).toEqual(['#general']);
    });

    it('excludes reports from other policies', () => {
        const reports: OnyxCollection<Report> = {
            report1: makeReport({reportID: '1', policyID: POLICY_A, reportName: '#general', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
            report2: makeReport({reportID: '2', policyID: POLICY_B, reportName: '#other', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
        };
        expect(policyRoomNamesSelector(POLICY_A)(reports)).toEqual(['#general']);
    });

    it('excludes reports without reportName', () => {
        const reports: OnyxCollection<Report> = {
            report1: makeReport({reportID: '1', policyID: POLICY_A, reportName: '#general', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
            report2: makeReport({reportID: '2', policyID: POLICY_A, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
        };
        expect(policyRoomNamesSelector(POLICY_A)(reports)).toEqual(['#general']);
    });

    it('excludes null entries in the collection', () => {
        const reports = {
            report1: makeReport({reportID: '1', policyID: POLICY_A, reportName: '#general', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}),
            report2: null,
        } as unknown as OnyxCollection<Report>;
        expect(policyRoomNamesSelector(POLICY_A)(reports)).toEqual(['#general']);
    });

    it('returns empty array when no reports match the policyID', () => {
        const reports: OnyxCollection<Report> = {
            report1: makeReport({reportID: '1', policyID: POLICY_B, reportName: '#other'}),
        };
        expect(policyRoomNamesSelector(POLICY_A)(reports)).toEqual([]);
    });
});
