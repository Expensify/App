import {fireEvent, screen} from '@testing-library/react-native';

import usePopoverMenuFocusManagement from '@components/PopoverMenu/usePopoverMenuFocusManagement/index.ios';
import type {FocusManagedMenuItem} from '@components/PopoverMenu/usePopoverMenuFocusManagement/types';
import {PressableWithoutFeedback} from '@components/Pressable';

import {getShouldSuppressBackgroundInputFocus} from '@libs/ModalFocusManager';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';

import React from 'react';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

jest.mock('@userActions/Modal', () => ({
    close: jest.fn(),
}));

const mockClose = jest.mocked(close);

/** A menu item that hands focus over to the screen it opens instead of restoring it to the input behind the menu. */
const MENU_ITEM: FocusManagedMenuItem = {shouldSkipFocusRestore: true};

function PopoverMenuSelectionProbe({onModalClose}: {onModalClose: () => void}) {
    const {prepareForSelection, requestCloseAfterFocusPolicyCommit} = usePopoverMenuFocusManagement({
        isVisible: true,
        menuItems: [MENU_ITEM],
        shouldEnableNewFocusManagement: true,
    });

    return (
        <PressableWithoutFeedback
            testID="popover-menu-item"
            accessibilityLabel="Menu item"
            role={CONST.ROLE.BUTTON}
            onPress={() => {
                prepareForSelection(MENU_ITEM);
                requestCloseAfterFocusPolicyCommit(onModalClose);
            }}
        />
    );
}

/**
 * The popover menus Home opens run this hook on iOS. Selecting an item takes a lease that keeps the input behind the
 * menu from grabbing focus back, and asks for the modal to close on the next commit. Both survive the transition the
 * selection starts, which is the very transition that covers Home, so a hide must not drop them: the lease was
 * released with nothing to re-acquire it, and the pending close was replayed on reveal, closing a second time.
 */
describe('PopoverMenu focus management on iOS', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('closes once for a selection the cover and reveal spans', async () => {
        const screenCover = renderScreenWithCover(<PopoverMenuSelectionProbe onModalClose={jest.fn()} />);
        fireEvent.press(screen.getByTestId('popover-menu-item'));
        expect(mockClose).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();

        expect(mockClose).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });

    it('keeps the background input focus suppressed across a cover and reveal', async () => {
        const screenCover = renderScreenWithCover(<PopoverMenuSelectionProbe onModalClose={jest.fn()} />);
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);

        fireEvent.press(screen.getByTestId('popover-menu-item'));
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        await screenCover.hide();
        await screenCover.reveal();

        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        screenCover.unmount();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });
});
