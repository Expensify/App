import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

export function createReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        reportName: `Report ${reportID}`,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: undefined,
        ownerAccountID: 1,
        isPinned: false,
        ...overrides,
    } as Report;
}
