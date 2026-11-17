import {fireEvent, render, screen} from '@testing-library/react-native';

import SidePanelExpandButton from '@components/SidePanel/SidePanelExpandButton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

import createMock from '../utils/createMock';

const REPORT_ID = '1';
const mockCloseSidePanel = jest.fn();
let mockFocusedReportID: string | undefined;

jest.mock('@hooks/useIsInSidePanel', () => jest.fn(() => true));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useSidePanelState', () => jest.fn());
jest.mock('@hooks/useSidePanelActions', () => jest.fn(() => ({closeSidePanel: mockCloseSidePanel, openSidePanel: jest.fn()})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useRootNavigationState', () => jest.fn((selector: (state: undefined) => unknown) => selector(undefined)));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), getFocusedReportId: () => mockFocusedReportID}));

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseSidePanelState = jest.mocked(useSidePanelState);
const mockNavigate = jest.mocked(Navigation.navigate);

function renderButton() {
    return render(<SidePanelExpandButton reportID={REPORT_ID} />);
}

describe('SidePanelExpandButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFocusedReportID = undefined;
        mockUseResponsiveLayout.mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: false}));
        mockUseSidePanelState.mockReturnValue(createMock<ReturnType<typeof useSidePanelState>>({isSidePanelResizable: true}));
    });

    it('closes the side panel and opens the same report in the Inbox', () => {
        // Given the side panel shows a report on a wide layout
        renderButton();

        // When the user presses Expand
        fireEvent.press(screen.getByLabelText('common.expand'));

        // Then the panel closes and the report opens in the Inbox at its newest messages
        expect(mockCloseSidePanel).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('is hidden when the same report is already the focused screen', () => {
        // Given the Inbox already shows the report that is open in the side panel
        mockFocusedReportID = REPORT_ID;

        // When the header renders
        renderButton();

        // Then there is nothing to expand into, so the button is not shown
        expect(screen.queryByLabelText('common.expand')).toBeNull();
    });

    it('is shown when a different report is the focused screen', () => {
        // Given the Inbox shows a different report than the side panel
        mockFocusedReportID = '2';

        // When the header renders
        renderButton();

        // Then the button is offered
        expect(screen.getByLabelText('common.expand')).toBeTruthy();
    });

    it('is hidden without the side panel resize beta', () => {
        // Given the user is not on the resizable side panel beta
        mockUseSidePanelState.mockReturnValue(createMock<ReturnType<typeof useSidePanelState>>({isSidePanelResizable: false}));

        // When the header renders
        renderButton();

        // Then the button is not shown
        expect(screen.queryByLabelText('common.expand')).toBeNull();
    });

    it('is hidden on a narrow layout', () => {
        // Given a narrow layout, where the side panel covers the whole screen
        mockUseResponsiveLayout.mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true}));

        // When the header renders
        renderButton();

        // Then the button is not shown
        expect(screen.queryByLabelText('common.expand')).toBeNull();
    });
});
