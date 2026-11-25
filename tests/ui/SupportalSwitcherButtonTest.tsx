import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as SupportalSwitcherButtonModule from '@pages/inbox/sidebar/SupportalSwitcherButton/index';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Jest resolves the native stub by default, but the switcher is desktop web only.
const SupportalSwitcherButton = jest.requireActual<typeof SupportalSwitcherButtonModule>('@pages/inbox/sidebar/SupportalSwitcherButton/index.tsx').default;

type MockPopoverProps = {isVisible: boolean};

let mockPopoverProps: MockPopoverProps | undefined;
const mockCalculatePopoverPosition = jest.fn(() => Promise.resolve({horizontal: 8, vertical: 600, width: 40, height: 40}));

jest.mock('@components/Navigation/SupportalSwitcher/SupportalSwitcherPopover', () => (props: MockPopoverProps) => {
    mockPopoverProps = props;
    return null;
});
jest.mock('@hooks/usePopoverPosition', () => ({
    __esModule: true,
    default: () => ({calculatePopoverPosition: mockCalculatePopoverPosition}),
}));

function renderButton(isSidebarHovered: boolean) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SupportalSwitcherButton isSidebarHovered={isSidebarHovered} />
        </ComposeProviders>,
    );
}

describe('SupportalSwitcherButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPopoverProps = undefined;
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'agent@example.com'});
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

    it('renders nothing for a user who cannot support login', async () => {
        // Given an ordinary account
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: false});

        // When the classic bar is hovered
        renderButton(true);
        await waitForBatchedUpdatesWithAct();

        // Then there is no button
        expect(screen.queryByTestId('supportal-switcher-button')).toBeNull();
    });

    it('reveals the button only while the sidebar is hovered', async () => {
        // Given a support agent and a sidebar nobody is hovering
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: true});
        const {rerender} = renderButton(false);
        await waitForBatchedUpdatesWithAct();

        // Then the floating button stays hidden, as it did before the switcher was shared with the flat bar
        expect(screen.queryByTestId('supportal-switcher-button')).toBeNull();

        // When the sidebar is hovered
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <SupportalSwitcherButton isSidebarHovered />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the button appears
        expect(screen.getByTestId('supportal-switcher-button')).toBeOnTheScreen();
    });

    it('opens the popover from the button', async () => {
        // Given a support agent hovering the sidebar
        await Onyx.merge(ONYXKEYS.ACCOUNT, {canSupportLogin: true});
        renderButton(true);
        await waitForBatchedUpdatesWithAct();
        expect(mockPopoverProps?.isVisible).toBe(false);

        // When the button is pressed
        fireEvent.press(screen.getByTestId('supportal-switcher-button'));
        await waitForBatchedUpdatesWithAct();

        // Then the button was measured and the popover is visible
        expect(mockCalculatePopoverPosition).toHaveBeenCalledTimes(1);
        expect(mockPopoverProps?.isVisible).toBe(true);
    });
});
