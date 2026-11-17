import {renderHook} from '@testing-library/react-native';

import {IsHiddenWideTabPreMountContext} from '@hooks/useIsHiddenWideTabPreMount';
import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';
import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearAllReportActionDrafts, clearReportActionDrafts} from '@libs/actions/Report';

import useClearReportActionDraftsOnReportChange from '@pages/inbox/report/useClearReportActionDraftsOnReportChange';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

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

type RenderDraftsHookProps = {reportID: string; isInPreloadedTab: boolean; isHiddenPreMount?: boolean};

function renderDraftsHook(initialProps: RenderDraftsHookProps) {
    let isInPreloadedTab = initialProps.isInPreloadedTab;
    let isHiddenPreMount = initialProps.isHiddenPreMount ?? false;
    const wrapper = ({children}: {children: ReactNode}) => (
        <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>
            <IsHiddenWideTabPreMountContext.Provider value={isHiddenPreMount}>{children}</IsHiddenWideTabPreMountContext.Provider>
        </IsInPreloadedTabContext.Provider>
    );
    const hook = renderHook(({reportID}: RenderDraftsHookProps) => useClearReportActionDraftsOnReportChange(reportID), {initialProps, wrapper});
    return {
        ...hook,
        rerenderWith: (props: RenderDraftsHookProps) => {
            isInPreloadedTab = props.isInPreloadedTab;
            isHiddenPreMount = props.isHiddenPreMount ?? false;
            hook.rerender(props);
        },
    };
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

    it('clears the drafts when a visible report screen mounts and when it unmounts', () => {
        // Given a report screen the user is looking at
        const {unmount} = renderDraftsHook({reportID: '1', isInPreloadedTab: false});

        // Then the drafts are cleared on mount, because the user moved to another report
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(1);

        // When the screen unmounts
        unmount();

        // Then the drafts are cleared again, because the user left the report
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(2);
    });

    it('keeps the drafts while the screen is mounted out of sight, and clears them once it is shown', () => {
        // Given a report screen mounted in a preloaded tab
        const {rerenderWith} = renderDraftsHook({reportID: '1', isInPreloadedTab: true});

        // Then nothing is cleared, so the report the user is editing keeps its draft
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();

        // When the screen is shown
        rerenderWith({reportID: '1', isInPreloadedTab: false});

        // Then the drafts are cleared, as if the user had just navigated to this report
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(1);
    });

    it('keeps the drafts while the screen is a hidden wide submit pre-mount, also when the form is cancelled', () => {
        // Given a report screen pre-mounted hidden under the report the user is editing
        const {unmount} = renderDraftsHook({reportID: '1', isInPreloadedTab: false, isHiddenPreMount: true});

        // When the user cancels the form, which unmounts the pre-mount without ever showing it
        unmount();

        // Then nothing is cleared, so the draft in the visible report survives
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();
    });

    it('clears the drafts once a hidden wide submit pre-mount is revealed', () => {
        // Given a report screen pre-mounted hidden under the current one
        const {rerenderWith} = renderDraftsHook({reportID: '1', isInPreloadedTab: false, isHiddenPreMount: true});

        // When the submit reveals it
        rerenderWith({reportID: '1', isInPreloadedTab: false, isHiddenPreMount: false});

        // Then the drafts are cleared, as if the user had just navigated to this report
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(1);
    });

    it('keeps the drafts when a visible screen ends up in a tab that becomes preloaded', () => {
        // Given a report screen the user saw before, which already cleared the drafts on mount
        const {rerenderWith, unmount} = renderDraftsHook({reportID: '1', isInPreloadedTab: false});
        mockClearAllReportActionDrafts.mockClear();

        // When its tab is marked preloaded (e.g. a wide submit pre-mount lands in that covered tab) and the screen later unmounts
        rerenderWith({reportID: '1', isInPreloadedTab: true});
        unmount();

        // Then nothing is cleared, because the user is editing a draft in another, visible report
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();
    });

    it('keeps the drafts when a seen screen comes back from a preloaded tab after a cancelled pre-mount', () => {
        // Given a report screen the user saw and left with an unsaved edit, which already cleared the drafts on mount
        const {rerenderWith} = renderDraftsHook({reportID: '1', isInPreloadedTab: false});
        mockClearAllReportActionDrafts.mockClear();

        // When a wide submit pre-mount marks its background tab preloaded, and cancelling it removes that mark again
        rerenderWith({reportID: '1', isInPreloadedTab: true});
        rerenderWith({reportID: '1', isInPreloadedTab: false});

        // Then nothing is cleared, because the user never went back to that report and the edit must survive
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();
    });

    it('clears the drafts when a visible screen switches to another report', () => {
        // Given a report screen the user is looking at
        const {rerenderWith} = renderDraftsHook({reportID: '1', isInPreloadedTab: false});
        mockClearAllReportActionDrafts.mockClear();

        // When it switches to another report
        rerenderWith({reportID: '2', isInPreloadedTab: false});

        // Then the drafts are cleared for leaving the old report and for opening the new one
        expect(mockClearAllReportActionDrafts).toHaveBeenCalledTimes(2);
    });
});
