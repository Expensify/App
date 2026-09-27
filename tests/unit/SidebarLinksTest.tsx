import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import SidebarLinks from '@pages/inbox/sidebar/SidebarLinks';

import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import React from 'react';

// Expose the row press handler (showReportPage) without rendering the full LHN option list.
jest.mock('@components/LHNOptionsList/LHNOptionsList', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return function MockLHNOptionsList({data, onSelectRow}: {data: Report[]; onSelectRow: (option: Report) => void}) {
        const [firstOption] = data;
        if (!firstOption) {
            return null;
        }

        return ReactModule.createElement('button', {testID: 'lhn-row', onPress: () => onSelectRow(firstOption)}, 'row');
    };
});

let mockShouldUseNarrowLayout = true;
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout, isInLandscapeMode: false}),
}));

jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useStyleUtils', () => ({__esModule: true, default: () => ({getSafeAreaMargins: () => ({marginBottom: 0})})}));
jest.mock('@hooks/useSidebarOrderedReports', () => ({useSidebarOrderedReportsActions: () => ({setStickyReportID: jest.fn()})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [false]}));
jest.mock('@libs/actions/App', () => ({setSidebarLoaded: jest.fn()}));
jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({hideContextMenu: jest.fn()}));
jest.mock('@libs/telemetry/activeSpans', () => ({cancelSpan: jest.fn()}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRoute: jest.fn(),
        getTopmostReportId: jest.fn(),
        getTopmostReportActionId: jest.fn(() => undefined),
        navigate: jest.fn(),
    },
}));

const REPORT_ID = '123';
const mockNavigation = jest.mocked(Navigation);

function renderSidebarLinks() {
    render(
        <SidebarLinks
            insets={{top: 0, left: 0, right: 0, bottom: 0}}
            optionListItems={[{reportID: REPORT_ID} as Report]}
            hasReportData
        />,
    );
}

describe('SidebarLinks showReportPage navigation guard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigation.getTopmostReportActionId.mockReturnValue(undefined);
    });

    // Regression test for the archived-chat dead tap: after opening a report, jumping to a Settings RHP, then
    // returning to Inbox, the report stays topmost in the reports split stack. On narrow layout the sidebar is
    // only shown on the Inbox screen (no report is displayed), so a tap must always navigate rather than be
    // treated as re-opening the active report.
    it('navigates from the sidebar on narrow layout even when the tapped report is still topmost', () => {
        mockShouldUseNarrowLayout = true;
        mockNavigation.getActiveRoute.mockReturnValue(`/${ROUTES.INBOX}`);
        mockNavigation.getTopmostReportId.mockReturnValue(REPORT_ID);

        renderSidebarLinks();
        fireEvent.press(screen.getByTestId('lhn-row'));

        expect(mockNavigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID, undefined));
    });

    it('still blocks re-opening the active report on wide layout', () => {
        mockShouldUseNarrowLayout = false;
        mockNavigation.getActiveRoute.mockReturnValue(`/r/${REPORT_ID}`);
        mockNavigation.getTopmostReportId.mockReturnValue(REPORT_ID);

        renderSidebarLinks();
        fireEvent.press(screen.getByTestId('lhn-row'));

        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('still blocks a quick second tap while a report is transitioning on narrow layout', () => {
        mockShouldUseNarrowLayout = true;
        mockNavigation.getActiveRoute.mockReturnValue('/r/999');
        mockNavigation.getTopmostReportId.mockReturnValue(undefined);

        renderSidebarLinks();
        fireEvent.press(screen.getByTestId('lhn-row'));

        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
});
