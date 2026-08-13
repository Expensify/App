import {getReportMentionDetails} from '@libs/MentionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {TNode, TText} from 'react-native-render-html';

import {TRenderEngine} from 'react-native-render-html';

type ReportFixture = Report & {reportID: string};

const renderEngine = new TRenderEngine();

const getFirstTextNode = (nodes: readonly TNode[]): TText | undefined => {
    for (const node of nodes) {
        if (node.type === 'text') {
            return node;
        }

        const textNode = getFirstTextNode(node.children);
        if (textNode) {
            return textNode;
        }
    }

    return undefined;
};

const makeTextNode = (data: string): TText => {
    const textNode = getFirstTextNode(renderEngine.buildTTree(`<span>${data}</span>`).children);
    if (!textNode) {
        throw new Error(`Unable to build mention text node for ${data}`);
    }

    return textNode;
};

const makeReportCollection = (...reports: ReportFixture[]): OnyxCollection<Report> =>
    Object.fromEntries(reports.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report]));

describe('MentionUtils', () => {
    describe('getReportMentionDetails', () => {
        it('should return the room report ID', () => {
            const reportID = '1';
            const currentReport: Report = {reportID: 'currentReport', policyID: '1'};
            const reports = makeReportCollection({reportID, reportName: '#hello', policyID: '1', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM});
            const mentionDetails = getReportMentionDetails('', currentReport, reports, makeTextNode('#hello'));
            expect(mentionDetails?.reportID).toBe(reportID);
        });
        it('should return undefined report ID when the report is not a room', () => {
            const reportID = '1';
            const currentReport: Report = {reportID: 'currentReport', policyID: '1'};
            const reports = makeReportCollection({reportID, reportName: '#hello', policyID: '1'});
            const mentionDetails = getReportMentionDetails('', currentReport, reports, makeTextNode('#hello'));
            expect(mentionDetails?.reportID).toBeUndefined();
        });
    });
});
