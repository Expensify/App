import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ChronosTimerHeaderButton from '@components/ChronosTimerHeaderButton';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {PopoverMenuItem, PopoverMenuProps} from '@components/PopoverMenu';

// eslint-disable-next-line no-restricted-imports -- type-only namespace import, used solely to type jest.requireActual for the ReportUtils mock below
import type * as ReportUtils from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockStartOrStopChronosTimer = jest.fn();
jest.mock('@libs/actions/Chronos', () => ({
    startOrStopChronosTimer: (...args: unknown[]): void => {
        mockStartOrStopChronosTimer(...args);
    },
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]): void => {
        mockNavigate(...args);
    },
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: () => false,
}));

jest.mock('@userActions/Session', () => ({
    callFunctionIfActionIsAllowed: (fn: () => void) => fn,
}));

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    canWriteInReport: () => true,
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 12345, timezone: {automatic: true, selected: 'America/Los_Angeles'}}),
}));

jest.mock('@hooks/useDelegateAccountID', () => ({
    __esModule: true,
    default: () => undefined,
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
const TEST_ACCOUNT_ID = 12345;
const TEST_START_TIME = '2026-07-13 10:00:00';

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

    it('starts the timer when the main button is pressed (no timer running)', async () => {
        // Given a rendered ChronosTimerHeaderButton with no Chronos timer NVP set
        renderComponent();
        await waitForBatchedUpdates();

        // When the main "Start Timer" button is pressed
        fireEvent.press(screen.getByText('Start Timer'));
        await waitForBatchedUpdates();

        // Then startOrStopChronosTimer is called with a null previousStartTime (i.e. it will start the timer)
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledTimes(1);
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledWith(mockReport, TEST_ACCOUNT_ID, null, undefined);
    });

    it('starts the timer when Start Timer is selected from the dropdown menu', async () => {
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

        // Then startOrStopChronosTimer is called with a null previousStartTime
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledTimes(1);
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledWith(mockReport, TEST_ACCOUNT_ID, null, undefined);
    });

    it('stops the timer when the main button is pressed while a timer is running', async () => {
        // Given the Chronos timer NVP reports a running timer (non-empty startTime)
        await Onyx.merge(ONYXKEYS.NVP_CHRONOS_TIME_TRACKING, {startTime: TEST_START_TIME});

        // When ChronosTimerHeaderButton is rendered, the button reflects the running state
        renderComponent();
        await waitForBatchedUpdates();

        // When the main "Stop Timer" button is pressed
        fireEvent.press(screen.getByText(/^Stop Timer/));
        await waitForBatchedUpdates();

        // Then startOrStopChronosTimer is called with the running timer's startTime (i.e. it will stop the timer)
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledTimes(1);
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledWith(mockReport, TEST_ACCOUNT_ID, TEST_START_TIME, undefined);
    });

    it('stays enabled and sends the command while OpenReport is in progress', async () => {
        // Given the OpenReport API is in flight for this report (RAM-only loading state set).
        // The button state no longer depends on report actions, so it must not be disabled during load.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${TEST_REPORT_ID}`, {
            isLoadingInitialReportActions: true,
        });

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

        // And pressing the main "Start Timer" button still triggers the action
        fireEvent.press(screen.getByText('Start Timer'));
        await waitForBatchedUpdates();
        expect(mockStartOrStopChronosTimer).toHaveBeenCalledTimes(1);
    });

    it('navigates to Schedule OOO when the option is selected from the dropdown menu', async () => {
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
