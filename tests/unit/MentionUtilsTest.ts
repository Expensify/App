import type {TText} from 'react-native-render-html';
import type {Report} from '@src/types/onyx';
import CONST from '@src/CONST';
import {getReportMentionDetails} from '@libs/MentionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    getReportName: jest.fn(),
    isChatRoom: jest.fn(() => true),
    isDefaultRoom: jest.fn(() => false),
    isUserCreatedPolicyRoom: jest.fn(() => false),
}));

jest.mock('@libs/MentionUtils', () => {
    const actual = jest.requireActual('@libs/MentionUtils');
    return {
        __esModule: true,
        ...actual,
        getReportMentionDetails: jest.fn(actual.getReportMentionDetails),
    };
});

const mockGetReportName = jest.requireMock('@libs/ReportUtils').getReportName as jest.Mock;
const mockIsChatRoom = jest.requireMock('@libs/ReportUtils').isChatRoom as jest.Mock;
const actualMentionUtils = jest.requireActual('@libs/MentionUtils');
const actualGetReportMentionDetails = actualMentionUtils.getReportMentionDetails;

describe('MentionUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('uses formatted report name when reportID attribute is present', () => {
        mockGetReportName.mockReturnValueOnce('$55.00 for dupe');
        const reports = {
            [`${ONYXKEYS.COLLECTION.REPORT}123`]: {
                reportID: '123',
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            },
        };

        const result = getReportMentionDetails('123', {} as never, reports, {} as never);

        expect(result?.reportID).toBe('123');
        expect(result?.mentionDisplayText).toBe('$55.00 for dupe');
    });

    it('falls back to formatted report name when matching by text', () => {
        mockGetReportName.mockReturnValue('$42.00 for lunch');

        const reports = {
            [`${ONYXKEYS.COLLECTION.REPORT}456`]: {
                reportID: '456',
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                policyID: 'ABC',
            },
        };

        const currentReport = {policyID: 'ABC'};
        const result = getReportMentionDetails('', currentReport as never, reports, {data: '#$42.00 for lunch'} as never);

        expect(result?.reportID).toBe('456');
        expect(result?.mentionDisplayText).toBe('$42.00 for lunch');
    });
});

describe('MentionUtils integration', () => {
    it('should return the room report ID', () => {
        mockIsChatRoom.mockReturnValue(true);
        mockGetReportName.mockReturnValue('#hello');
        const reportID = '1';
        const mentionDetails = actualGetReportMentionDetails(
            '',
            {policyID: '1'} as Report,
            {[reportID]: {reportID, reportName: '#hello', policyID: '1', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}},
            {data: '#hello'} as TText,
        );
        expect(mentionDetails?.reportID).toBe(reportID);
    });
    it('should return undefined report ID when the report is not a room', () => {
        mockIsChatRoom.mockReturnValue(false);
        mockGetReportName.mockReturnValue('#hello');
        const reportID = '1';
        const mentionDetails = actualGetReportMentionDetails('', {policyID: '1'} as Report, {[reportID]: {reportID, reportName: '#hello', policyID: '1'}}, {data: '#hello'} as TText);
        expect(mentionDetails?.reportID).toBeUndefined();
    });
});
