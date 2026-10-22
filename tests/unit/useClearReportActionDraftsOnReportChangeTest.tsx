import {renderHook} from '@testing-library/react-native';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearAllReportActionDrafts, clearReportActionDrafts} from '@libs/actions/Report';

import useClearReportActionDraftsOnReportChange from '@pages/inbox/report/useClearReportActionDraftsOnReportChange';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@libs/actions/Report', () => ({
    clearAllReportActionDrafts: jest.fn(),
    clearReportActionDrafts: jest.fn(),
}));

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockClearAllReportActionDrafts = jest.mocked(clearAllReportActionDrafts);
const mockClearReportActionDrafts = jest.mocked(clearReportActionDrafts);

function SidePanelWrapper({children}: {children: React.ReactNode}) {
    return <IsInSidePanelContext.Provider value>{children}</IsInSidePanelContext.Provider>;
}

function mockScreenWidth(isExtraLargeScreenWidth: boolean) {
    mockUseResponsiveLayout.mockReturnValue({
        ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
        isExtraLargeScreenWidth,
    });
}

describe('useClearReportActionDraftsOnReportChange', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockScreenWidth(true);
    });

    it('clears drafts on mount, on report change and on unmount for the central report', () => {
        // Given the hook is rendered for a report outside the side panel
        const {rerender, unmount} = renderHook(({reportID}: {reportID: string}) => useClearReportActionDraftsOnReportChange(reportID), {initialProps: {reportID: '1'}});

        // Then drafts are cleared on mount so a draft from another report doesn't stay in edit mode
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(1);

        // When the user switches to another report
        rerender({reportID: '2'});

        // Then drafts are cleared for the report being left and for the new report
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(3);

        // When the report screen unmounts
        unmount();

        // Then drafts are cleared again so leaving the report discards the edit
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(4);
    });

    it('clears only the side panel report drafts when the side panel is docked', () => {
        // Given the hook is rendered for the Concierge report inside the docked side panel, next to a central report that may be editing a message
        const {unmount} = renderHook(() => useClearReportActionDraftsOnReportChange('1'), {wrapper: SidePanelWrapper});

        // Then only the side panel report's drafts are cleared on mount
        expect(mockClearReportActionDrafts).toHaveBeenCalledTimes(1);
        expect(mockClearReportActionDrafts).toHaveBeenLastCalledWith('1');

        // When the side panel is closed and its report unmounts
        unmount();

        // Then the side panel's own edit draft is discarded, as on any other report
        expect(mockClearReportActionDrafts).toHaveBeenCalledTimes(2);
        expect(mockClearReportActionDrafts).toHaveBeenLastCalledWith('1');

        // And the central report's edit draft is kept
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();
    });

    it('clears all drafts when the side panel is a narrow modal', () => {
        // Given the screen is too narrow to dock the side panel, so it opens as a modal that covers the central report like a new page
        mockScreenWidth(false);

        // When the hook is rendered for the report inside the side panel and then unmounts
        const {unmount} = renderHook(() => useClearReportActionDraftsOnReportChange('1'), {wrapper: SidePanelWrapper});
        unmount();

        // Then all drafts are cleared on mount and unmount, keeping the existing behavior when leaving a report
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(2);
        expect(mockClearReportActionDrafts).not.toHaveBeenCalled();
    });
});
