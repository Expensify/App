import getCentralPaneReportID from '@libs/Navigation/helpers/getCentralPaneReportID';
import getTopmostFullScreenRoute from '@libs/Navigation/helpers/getTopmostFullScreenRoute';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';

import NAVIGATORS from '@src/NAVIGATORS';

jest.mock('@libs/Navigation/navigationRef', () => ({getRootState: jest.fn(() => ({}))}));
jest.mock('@libs/Navigation/helpers/getTopmostReportParams', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getTopmostFullScreenRoute', () => jest.fn());

const mockGetTopmostReportParams = jest.mocked(getTopmostReportParams);
const mockGetTopmostFullScreenRoute = jest.mocked(getTopmostFullScreenRoute);
type ReportParams = ReturnType<typeof getTopmostReportParams>;
type FullScreenRoute = ReturnType<typeof getTopmostFullScreenRoute>;

const inboxRoute = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR} as FullScreenRoute;

beforeEach(() => {
    mockGetTopmostReportParams.mockReset();
    // Default: Inbox is the active full-screen tab, so the central report is not gated out.
    mockGetTopmostFullScreenRoute.mockReset().mockReturnValue(inboxRoute);
});

describe('getCentralPaneReportID', () => {
    it('returns the reportID of the report in the central pane', () => {
        mockGetTopmostReportParams.mockReturnValue({reportID: '42'} as ReportParams);
        expect(getCentralPaneReportID()).toBe('42');
    });

    it('returns undefined when no report is in the central pane', () => {
        mockGetTopmostReportParams.mockReturnValue(undefined);
        expect(getCentralPaneReportID()).toBeUndefined();
    });

    it('returns undefined when the reports split navigator is not the active tab (stale report on an inactive Inbox)', () => {
        mockGetTopmostFullScreenRoute.mockReturnValue({name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR} as FullScreenRoute);
        mockGetTopmostReportParams.mockReturnValue({reportID: '42'} as ReportParams);
        expect(getCentralPaneReportID()).toBeUndefined();
    });
});
