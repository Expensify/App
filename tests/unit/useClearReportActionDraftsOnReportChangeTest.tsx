import {renderHook} from '@testing-library/react-native';

import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';

import {clearAllReportActionDrafts} from '@libs/actions/Report';

import useClearReportActionDraftsOnReportChange from '@pages/inbox/report/useClearReportActionDraftsOnReportChange';

import type {ReactNode} from 'react';

import React from 'react';

jest.mock('@libs/actions/Report', () => ({
    clearAllReportActionDrafts: jest.fn(),
}));

const mockClearAllReportActionDrafts = jest.mocked(clearAllReportActionDrafts);

type HookProps = {reportID: string; isInPreloadedTab: boolean};

function renderDraftsHook(initialProps: HookProps) {
    let isInPreloadedTab = initialProps.isInPreloadedTab;
    const wrapper = ({children}: {children: ReactNode}) => <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>{children}</IsInPreloadedTabContext.Provider>;
    const hook = renderHook(({reportID}: HookProps) => useClearReportActionDraftsOnReportChange(reportID), {initialProps, wrapper});
    return {
        ...hook,
        rerenderWith: (props: HookProps) => {
            isInPreloadedTab = props.isInPreloadedTab;
            hook.rerender(props);
        },
    };
}

describe('useClearReportActionDraftsOnReportChange', () => {
    beforeEach(() => {
        mockClearAllReportActionDrafts.mockClear();
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
        // Given a report screen mounted in a preloaded tab or as a hidden wide submit pre-mount
        const {rerenderWith} = renderDraftsHook({reportID: '1', isInPreloadedTab: true});

        // Then nothing is cleared, so the report the user is editing keeps its draft
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();

        // When the screen is shown
        rerenderWith({reportID: '1', isInPreloadedTab: false});

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
