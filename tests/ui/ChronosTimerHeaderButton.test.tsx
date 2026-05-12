import {PortalProvider} from '@gorhom/portal';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ChronosTimerHeaderButton from '@components/ChronosTimerHeaderButton';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {PopoverMenuItem, PopoverMenuProps} from '@components/PopoverMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockAddComment = jest.fn();
jest.mock('@userActions/Report', () => ({
    addComment: (...args: unknown[]): void => {
        mockAddComment(...args);
    },
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]): void => {
        mockNavigate(...args);
    },
    isTopmostRouteModalScreen: () => false,
}));

jest.mock('@userActions/Session', () => ({
    callFunctionIfActionIsAllowed: (fn: () => void) => fn,
}));

jest.mock('@libs/ReportUtils', () => ({
    canUserPerformWriteAction: () => true,
    canWriteInReport: () => true,
    getAncestors: () => [],
}));

jest.mock('@libs/ChronosUtils', () => ({
    isChronosTimerRunningFromVisibleActions: () => false,
}));

jest.mock('@libs/ReportActionsUtils', () => ({
    getSortedReportActionsForDisplay: () => [],
}));

jest.mock('@hooks/useIsInSidePanel', () => ({
    __esModule: true,
    default: () => false,
}));

const mockUseNetwork = jest.fn(() => ({isOffline: false}));
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => mockUseNetwork(),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 12345, timezone: {automatic: true, selected: 'America/Los_Angeles'}}),
}));

/**
 * A simplified PopoverMenu that renders menu items as pressable elements
 * and directly invokes onSelected, bypassing the modal animation lifecycle.
 */
jest.mock('@components/PopoverMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module object
    const {View, Text, TouchableOpacity} = jest.requireActual('react-native');
    function MockPopoverMenu({isVisible, menuItems, onClose, onItemSelected}: PopoverMenuProps) {
        if (!isVisible) {
            return null;
        }
        return (
            <View>
                {menuItems.map((item: PopoverMenuItem, index: number) => (
                    <TouchableOpacity
                        key={item.text}
                        accessibilityRole="menuitem"
                        testID={`PopoverMenuItem-${item.text}`}
                        onPress={() => {
                            onItemSelected?.(item, index);
                            item.onSelected?.();
                            onClose();
                        }}
                    >
                        <Text>{item.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }
    MockPopoverMenu.displayName = 'PopoverMenu';
    return MockPopoverMenu;
});

const TEST_REPORT_ID = '123456789';

const mockReport: Report = {
    reportID: TEST_REPORT_ID,
    reportName: 'Chronos Test',
    type: CONST.REPORT.TYPE.CHAT,
} as Report;

/**
 * Finds the dropdown arrow button (the split button with expanded accessibility state).
 */
function getDropdownArrowButton() {
    const buttons = screen.getAllByRole('button');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const dropdownButton = buttons.find((btn) => btn.props.accessibilityState?.expanded !== undefined);
    if (!dropdownButton) {
        throw new Error('Could not find dropdown arrow button');
    }
    return dropdownButton;
}

function renderComponent() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, PortalProvider]}>
            <ChronosTimerHeaderButton report={mockReport} />
        </ComposeProviders>,
    );
}

describe('ChronosTimerHeaderButton', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false});
    });

    it('should send a start timer command when the main button is pressed', async () => {
        // Given a rendered ChronosTimerHeaderButton
        renderComponent();
        await waitForBatchedUpdates();

        // When the main "Start Timer" button is pressed
        fireEvent.press(screen.getByText('Start Timer'));
        await waitForBatchedUpdates();

        // Then addComment is called with the start timer command
        expect(mockAddComment).toHaveBeenCalledTimes(1);
        expect(mockAddComment).toHaveBeenCalledWith(
            expect.objectContaining({
                report: mockReport,
                text: CONST.CHRONOS.TIMER_COMMAND.START,
            }),
        );
    });

    it('should send a start timer command when Start Timer is selected from the dropdown menu', async () => {
        // Given a rendered ChronosTimerHeaderButton
        renderComponent();
        await waitForBatchedUpdates();

        // When the dropdown is opened and "Start Timer" is selected
        fireEvent.press(getDropdownArrowButton());
        await waitForBatchedUpdates();
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Start Timer')).toBeOnTheScreen();
        });
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Start Timer'));
        await waitForBatchedUpdates();

        // Then addComment is called with the start timer command
        expect(mockAddComment).toHaveBeenCalledTimes(1);
        expect(mockAddComment).toHaveBeenCalledWith(
            expect.objectContaining({
                report: mockReport,
                text: CONST.CHRONOS.TIMER_COMMAND.START,
            }),
        );
    });

    it('should disable the button while the OpenReport API is in progress', async () => {
        // Given the OpenReport API is in flight for this report (RAM-only loading state set)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TEST_REPORT_ID}`, {
            isLoadingInitialReportActions: true,
        });

        // When ChronosTimerHeaderButton is rendered
        renderComponent();
        await waitForBatchedUpdates();

        // Then every rendered button reports a disabled accessibility state
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
        for (const btn of buttons) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- React test instance `.props` is typed as `unknown`; we read the rendered accessibilityState directly here
            expect(btn.props.accessibilityState?.disabled).toBe(true);
        }

        // And pressing the main "Start Timer" button does not trigger addComment
        fireEvent.press(screen.getByText('Start Timer'));
        await waitForBatchedUpdates();
        expect(mockAddComment).not.toHaveBeenCalled();
    });

    it('should not send a start timer command from an already-open dropdown when OpenReport flips to in-progress', async () => {
        // Given the report is already loaded and the dropdown menu is open with the Start Timer option visible
        renderComponent();
        await waitForBatchedUpdates();
        fireEvent.press(getDropdownArrowButton());
        await waitForBatchedUpdates();
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Start Timer')).toBeOnTheScreen();
        });

        // When a background OpenReport for the same report kicks off (e.g. from a remount of the report list)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TEST_REPORT_ID}`, {
            isLoadingInitialReportActions: true,
        });
        await waitForBatchedUpdates();

        // And the user selects the (already-visible) Start Timer item from the popover
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Start Timer'));
        await waitForBatchedUpdates();

        // Then addComment is not called because the option is gated by the in-flight OpenReport
        expect(mockAddComment).not.toHaveBeenCalled();
    });

    it('should not navigate to Schedule OOO from an already-open dropdown when OpenReport flips to in-progress', async () => {
        // Given the report is already loaded and the dropdown menu is open with the Schedule OOO option visible
        renderComponent();
        await waitForBatchedUpdates();
        fireEvent.press(getDropdownArrowButton());
        await waitForBatchedUpdates();
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Schedule OOO')).toBeOnTheScreen();
        });

        // When a background OpenReport for the same report kicks off
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TEST_REPORT_ID}`, {
            isLoadingInitialReportActions: true,
        });
        await waitForBatchedUpdates();

        // And the user selects the (already-visible) Schedule OOO item from the popover
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Schedule OOO'));
        await waitForBatchedUpdates();

        // Then Navigation.navigate is not called because the option is gated by the in-flight OpenReport
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should keep the button enabled while offline so queued start/stop comments are sent on reconnect', async () => {
        // Given the OpenReport API is optimistically in flight for this report
        // (its optimisticData sets isLoadingInitialReportActions=true)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TEST_REPORT_ID}`, {
            isLoadingInitialReportActions: true,
        });

        // And the app is offline (so the OpenReport request is queued and isLoadingInitialReportActions
        // would stay true until reconnect)
        mockUseNetwork.mockReturnValue({isOffline: true});

        // When ChronosTimerHeaderButton is rendered
        renderComponent();
        await waitForBatchedUpdates();

        // Then no rendered button is marked disabled via accessibility state
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
        for (const btn of buttons) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- React test instance `.props` is typed as `unknown`; we read the rendered accessibilityState directly here
            expect(btn.props.accessibilityState?.disabled).not.toBe(true);
        }

        // And pressing the main "Start Timer" button still queues the start timer command
        fireEvent.press(screen.getByText('Start Timer'));
        await waitForBatchedUpdates();
        expect(mockAddComment).toHaveBeenCalledTimes(1);
        expect(mockAddComment).toHaveBeenCalledWith(
            expect.objectContaining({
                report: mockReport,
                text: CONST.CHRONOS.TIMER_COMMAND.START,
            }),
        );
    });

    it('should navigate to Schedule OOO when the option is selected from the dropdown menu', async () => {
        // Given a rendered ChronosTimerHeaderButton
        renderComponent();
        await waitForBatchedUpdates();

        // When the dropdown is opened and "Schedule OOO" is selected
        fireEvent.press(getDropdownArrowButton());
        await waitForBatchedUpdates();
        await waitFor(() => {
            expect(screen.getByTestId('PopoverMenuItem-Schedule OOO')).toBeOnTheScreen();
        });
        fireEvent.press(screen.getByTestId('PopoverMenuItem-Schedule OOO'));
        await waitForBatchedUpdates();

        // Then Navigation.navigate is called with the Schedule OOO route
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(`r/${TEST_REPORT_ID}/chronos/schedule-ooo`);
    });
});
