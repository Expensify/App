import {renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import useFollowActionBadgeTarget from '@pages/inbox/report/useFollowActionBadgeTarget';

import type {ReportAction} from '@src/types/onyx';

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

const mockNavigation = Navigation as jest.Mocked<typeof Navigation>;

function makeAction(reportActionID: string): ReportAction {
    return {reportActionID} as ReportAction;
}

describe('useFollowActionBadgeTarget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigation.getTopmostReportId.mockReturnValue(REPORT_ID);
        mockNavigation.getReportRHPActiveRoute.mockReturnValue(undefined);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('follows a newer badge target when the previous target is hidden inside a collapsed run', () => {
        const scrollToActionBadgeTarget = jest.fn();
        const renderedVisibleReportActions = [makeAction('current'), makeAction('summary')];
        const reportActionIDToDisplayIndex = new Map([
            ['current', 0],
            ['previous', 1],
        ]);
        const {rerender} = renderHook(
            ({actionTargetReportActionID, actionBadgeTargetIndex}: {actionTargetReportActionID: string; actionBadgeTargetIndex: number}) =>
                useFollowActionBadgeTarget({
                    isProduction: false,
                    reportID: REPORT_ID,
                    actionTargetReportActionID,
                    actionBadgeTargetIndex,
                    renderedVisibleReportActions,
                    reportActionIDToDisplayIndex,
                    scrollToActionBadgeTarget,
                }),
            {initialProps: {actionTargetReportActionID: 'previous', actionBadgeTargetIndex: 1}},
        );

        rerender({actionTargetReportActionID: 'current', actionBadgeTargetIndex: 0});

        expect(scrollToActionBadgeTarget).toHaveBeenCalledTimes(1);
    });
});
