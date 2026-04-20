/* eslint-disable @typescript-eslint/naming-convention -- Mock module paths use non-standard naming conventions required by jest.mock */
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
