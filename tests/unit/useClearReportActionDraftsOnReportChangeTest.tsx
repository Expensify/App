import {renderHook} from '@testing-library/react-native';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';

import {clearAllReportActionDrafts} from '@libs/actions/Report';

import useClearReportActionDraftsOnReportChange from '@pages/inbox/report/useClearReportActionDraftsOnReportChange';

import React from 'react';

jest.mock('@libs/actions/Report', () => ({
    clearAllReportActionDrafts: jest.fn(),
}));

const mockClearAllReportActionDrafts = jest.mocked(clearAllReportActionDrafts);

function SidePanelWrapper({children}: {children: React.ReactNode}) {
    return <IsInSidePanelContext.Provider value>{children}</IsInSidePanelContext.Provider>;
}

describe('useClearReportActionDraftsOnReportChange', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

    it('does not clear drafts when the report is rendered in the side panel', () => {
        // Given the hook is rendered for the Concierge report inside the side panel, next to a central report that may be editing a message
        const {unmount} = renderHook(() => useClearReportActionDraftsOnReportChange('1'), {wrapper: SidePanelWrapper});

        // When the side panel is closed and its report unmounts
        unmount();

        // Then the central report's edit draft is kept
        expect(mockClearAllReportActionDrafts).not.toHaveBeenCalled();
    });
});
