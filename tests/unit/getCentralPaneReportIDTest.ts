import getCentralPaneReportID from '@libs/Navigation/helpers/getCentralPaneReportID';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';

jest.mock('@libs/Navigation/navigationRef', () => ({getRootState: jest.fn(() => ({}))}));
jest.mock('@libs/Navigation/helpers/getTopmostReportParams', () => jest.fn());

const mockGetTopmostReportParams = jest.mocked(getTopmostReportParams);
type ReportParams = ReturnType<typeof getTopmostReportParams>;

beforeEach(() => mockGetTopmostReportParams.mockReset());

describe('getCentralPaneReportID', () => {
    it('returns the reportID of the report in the central pane', () => {
        mockGetTopmostReportParams.mockReturnValue({reportID: '42'} as ReportParams);
        expect(getCentralPaneReportID()).toBe('42');
    });

    it('returns undefined when no report is in the central pane', () => {
        mockGetTopmostReportParams.mockReturnValue(undefined);
        expect(getCentralPaneReportID()).toBeUndefined();
    });
});
