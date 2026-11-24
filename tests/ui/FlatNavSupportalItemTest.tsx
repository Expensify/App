import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type * as FlatNavSupportalItemModule from '@components/Navigation/FlatNavigationBar/FlatNavSupportalItem/index';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Jest resolves the native stub by default, but the row is desktop web only.
const FlatNavSupportalItem = jest.requireActual<typeof FlatNavSupportalItemModule>('@components/Navigation/FlatNavigationBar/FlatNavSupportalItem/index.tsx').default;

type MockPopoverProps = {isVisible: boolean; onClose: () => void; onModalHide?: () => void};

let mockPopoverProps: MockPopoverProps | undefined;
const mockCalculatePopoverPosition = jest.fn(() => Promise.resolve({horizontal: 8, vertical: 600, width: 216, height: 40}));

jest.mock('@components/Navigation/SupportalSwitcher/SupportalSwitcherPopover', () => (props: MockPopoverProps) => {
    mockPopoverProps = props;
    return null;
});
jest.mock('@hooks/usePopoverPosition', () => ({
    __esModule: true,
    default: () => ({calculatePopoverPosition: mockCalculatePopoverPosition}),
}));

type RenderOptions = {isSupportAgent?: boolean; isSwitcherVisible?: boolean; isCollapsed?: boolean};

function renderItem({isSupportAgent = true, isSwitcherVisible = false, isCollapsed = false}: RenderOptions = {}) {
    const showSwitcher = jest.fn();
    const hideSwitcher = jest.fn();
    const onSwitcherHidden = jest.fn();
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <FlatNavSupportalItem
                isCollapsed={isCollapsed}
                isSupportAgent={isSupportAgent}
                isSwitcherVisible={isSwitcherVisible}
                showSwitcher={showSwitcher}
                hideSwitcher={hideSwitcher}
                onSwitcherHidden={onSwitcherHidden}
            />
        </ComposeProviders>,
    );
    return {showSwitcher, hideSwitcher, onSwitcherHidden};
}

describe('FlatNavSupportalItem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPopoverProps = undefined;
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

    it('renders nothing for a user who cannot use the switcher', async () => {
        // Given a user without support login permissions
        const isSupportAgent = false;

        // When the supportal item renders
        renderItem({isSupportAgent});
        await waitForBatchedUpdatesWithAct();

        // Then neither the row nor the popover is rendered because the switcher is restricted to support agents
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
        expect(mockPopoverProps).toBeUndefined();
    });

    it('shows a button row named after the switcher', async () => {
        // Given an expanded bar for a support agent
        const isCollapsed = false;

        // When the supportal item renders
        renderItem({isCollapsed});
        await waitForBatchedUpdatesWithAct();

        // Then the row is a button that opens a popover, not a tab, and is closed
        const row = screen.getByRole(CONST.ROLE.BUTTON, {name: 'Supportal into another account'});
        expect(row.props.accessibilityState).toEqual(expect.objectContaining({expanded: false}));
        expect(row.props.accessibilityHasPopup).toBe('dialog');
    });

    it('keeps the row reachable by its name while collapsed', async () => {
        // Given a support agent whose navigation bar is narrowed to an icon rail
        const isCollapsed = true;

        // When the supportal item renders
        renderItem({isCollapsed});
        await waitForBatchedUpdatesWithAct();

        // Then the icon-only row can still be found by its accessible name
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Supportal into another account'})).toBeOnTheScreen();
    });

    it('opens the switcher once the row is measured', async () => {
        // Given a support agent
        const {showSwitcher} = renderItem();
        await waitForBatchedUpdatesWithAct();

        // When the row is pressed
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Supportal into another account'}));
        await waitForBatchedUpdatesWithAct();

        // Then the row was measured and the switcher asked to open
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        expect(showSwitcher).toHaveBeenCalledTimes(1);
    });

    it('marks the row open while the switcher is showing', async () => {
        // Given a support agent whose switcher is active
        const isSwitcherVisible = true;

        // When the supportal item renders
        renderItem({isSwitcherVisible});
        await waitForBatchedUpdatesWithAct();

        // Then the row reports itself as expanded and the popover is visible
        const row = screen.getByRole(CONST.ROLE.BUTTON, {name: 'Supportal into another account'});
        expect(row.props.accessibilityState).toEqual(expect.objectContaining({expanded: true}));
        expect(mockPopoverProps?.isVisible).toBe(true);
    });

    it('hands the popover close and modal hide back to the bar', async () => {
        // Given a support agent whose switcher is open
        const {hideSwitcher, onSwitcherHidden} = renderItem({isSwitcherVisible: true});
        await waitForBatchedUpdatesWithAct();

        // When the popover closes and its modal is gone
        act(() => {
            mockPopoverProps?.onClose();
            mockPopoverProps?.onModalHide?.();
        });

        // Then the bar is told, so it can hide the switcher and end the peek it held
        expect(hideSwitcher).toHaveBeenCalledTimes(1);
        expect(onSwitcherHidden).toHaveBeenCalledTimes(1);
    });
});
