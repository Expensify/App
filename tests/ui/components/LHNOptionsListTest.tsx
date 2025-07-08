import {NavigationContainer} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';
import {render, screen, userEvent, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import type {LHNOptionsListProps} from '@components/LHNOptionsList/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getFakeReport} from '../../utils/LHNTestUtils';

// Mock the context menu
jest.mock('@pages/home/report/ContextMenu/ReportActionContextMenu', () => ({
    showContextMenu: jest.fn(),
}));

// Mock the useRootNavigationState hook
jest.mock('@src/hooks/useRootNavigationState');

// Mock navigation hooks
const mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        useIsFocused: () => mockUseIsFocused(),
        useRoute: jest.fn(),
        useNavigationState: jest.fn(),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

const getReportItem = (reportID: string) => {
    return screen.findByTestId(reportID);
};

const getReportItemButton = () => {
    return userEvent.setup();
};

describe('LHNOptionsList', () => {
    const mockReport = getFakeReport([1, 2], 0, false);

    const defaultProps: LHNOptionsListProps = {
        data: [mockReport],
        onSelectRow: jest.fn(),
        optionMode: CONST.OPTION_MODE.DEFAULT,
        onFirstItemRendered: jest.fn(),
    };

    const getLHNOptionsListElement = (props: Partial<LHNOptionsListProps> = {}) => {
        const mergedProps = {
            data: props.data ?? defaultProps.data,
            onSelectRow: props.onSelectRow ?? defaultProps.onSelectRow,
            optionMode: props.optionMode ?? defaultProps.optionMode,
            onFirstItemRendered: props.onFirstItemRendered ?? defaultProps.onFirstItemRendered,
        };

        return (
            <NavigationContainer>
                <ComposeProviders components={[OnyxProvider, LocaleContextProvider]}>
                    <LHNOptionsList
                        data={mergedProps.data}
                        onSelectRow={mergedProps.onSelectRow}
                        optionMode={mergedProps.optionMode}
                        onFirstItemRendered={mergedProps.onFirstItemRendered}
                    />
                </ComposeProviders>
            </NavigationContainer>
        );
    };

    beforeEach(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        return Onyx.clear();
    });

    it('shows context menu on long press', async () => {
        // Given the screen is focused.
        mockUseIsFocused.mockReturnValue(true);

        // Given the LHNOptionsList is rendered with a report.
        render(getLHNOptionsListElement());

        // Then wait for the report to be displayed in the LHNOptionsList.
        const reportItem = await waitFor(() => getReportItem(mockReport.reportID));
        expect(reportItem).toBeTruthy();

        // When the user long presses the report item.
        const user = getReportItemButton();
        await user.longPress(reportItem);

        // Then wait for all state updates to complete and verify the context menu is shown
        await waitFor(() => {
            expect(showContextMenu).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.CONTEXT_MENU_TYPES.REPORT,
                    report: expect.objectContaining({
                        reportID: mockReport.reportID,
                    }),
                }),
            );
        });
    });

    it('does not show context menu when screen is not focused', async () => {
        // Given the screen is not focused.
        mockUseIsFocused.mockReturnValue(false);

        // When the LHNOptionsList is rendered.
        render(getLHNOptionsListElement());

        // Then wait for the report to be displayed in the LHNOptionsList.
        const reportItem = await waitFor(() => getReportItem(mockReport.reportID));
        expect(reportItem).toBeTruthy();

        // When the user long presses the report item.
        const user = getReportItemButton();
        await user.longPress(reportItem);

        // Then wait for all state updates to complete and verify the context menu is not shown
        await waitFor(() => {
            expect(showContextMenu).not.toHaveBeenCalled();
        });
    });

    it('shows context menu after returning from chat', async () => {
        // Given the screen is focused.
        mockUseIsFocused.mockReturnValue(true);

        // When the LHNOptionsList is rendered.
        const {rerender} = render(getLHNOptionsListElement());

        // Then wait for the report to be displayed in the LHNOptionsList.
        const reportItem = await waitFor(() => getReportItem(mockReport.reportID));
        expect(reportItem).toBeTruthy();

        // When the user navigates to chat and back by re-rendering with different focus state
        rerender(getLHNOptionsListElement());

        // When the user re-renders again to simulate returning to the screen
        rerender(getLHNOptionsListElement());

        // When the user long presses the report item.
        const user = getReportItemButton();
        await user.longPress(reportItem);

        // Then wait for all state updates to complete and verify the context menu is shown
        await waitFor(() => {
            expect(showContextMenu).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.CONTEXT_MENU_TYPES.REPORT,
                    report: expect.objectContaining({
                        reportID: mockReport.reportID,
                    }),
                }),
            );
        });
    });
});
