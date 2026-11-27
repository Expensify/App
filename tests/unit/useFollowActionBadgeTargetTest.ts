import {renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import useFollowActionBadgeTarget from '@pages/inbox/report/useFollowActionBadgeTarget';

import {getFakeReportAction} from '../utils/ReportTestUtils';

const REPORT_ID = 'report';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getTopmostReportId: jest.fn(() => REPORT_ID),
        getReportRHPActiveRoute: jest.fn(),
    },
}));

jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
});

const mockGetTopmostReportId = jest.mocked(Navigation.getTopmostReportId);
const mockGetReportRHPActiveRoute = jest.mocked(Navigation.getReportRHPActiveRoute);

function makeAction(reportActionID: string) {
    return getFakeReportAction(1, {reportActionID});
}

describe('useFollowActionBadgeTarget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetTopmostReportId.mockReturnValue(REPORT_ID);
        mockGetReportRHPActiveRoute.mockReturnValue('');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('follows a newer badge target when the previous target is hidden inside a collapsed run', () => {
        // Given the previous target is represented by an older summary row in the chronological list.
        const scrollToActionBadgeTarget = jest.fn();
        const renderedVisibleReportActions = [makeAction('summary'), makeAction('current')];
        const reportActionIDToDisplayIndex = new Map([
            ['previous', 0],
            ['current', 1],
        ]);
        const {rerender} = renderHook(
            ({actionTargetReportActionID, actionBadgeTargetIndex}: {actionTargetReportActionID: string; actionBadgeTargetIndex: number}) =>
                useFollowActionBadgeTarget({
                    reportID: REPORT_ID,
                    actionTargetReportActionID,
                    actionBadgeTargetIndex,
                    renderedVisibleReportActions,
                    reportActionIDToDisplayIndex,
                    scrollToActionBadgeTarget,
                }),
            {initialProps: {actionTargetReportActionID: 'previous', actionBadgeTargetIndex: 0}},
        );

        // When the badge advances to a newer action outside the collapsed run.
        rerender({actionTargetReportActionID: 'current', actionBadgeTargetIndex: 1});

        // Then the list follows the new target using the hidden action's mapped position.
        expect(scrollToActionBadgeTarget).toHaveBeenCalledTimes(1);
    });
});
