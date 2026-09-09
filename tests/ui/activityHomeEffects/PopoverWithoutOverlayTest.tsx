import PopoverWithoutOverlay from '@components/PopoverWithoutOverlay';
import Text from '@components/Text';

import {onModalDidClose, setCloseModal} from '@libs/actions/Modal';

import type {View} from 'react-native';

import React, {createRef} from 'react';

import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

jest.mock('@libs/actions/Modal', () => ({
    onModalDidClose: jest.fn(),
    setCloseModal: jest.fn(() => () => {}),
    willAlertModalBecomeVisible: jest.fn(),
}));

const anchorRef = createRef<View>();
const withoutOverlayRef = createRef<View>();

/**
 * Home renders this popover through its measured-content menus, so it is mounted inside the tab whether or not the
 * popover is open. Its single effect announces an open or a close to shared modal state, and both announcements are
 * one-shot: a repeated close consumes the pending close callback of whichever modal is waiting for it, and a repeated
 * open re-runs the consumer's onModalShow. A cover and reveal must not produce either.
 */
describe('PopoverWithoutOverlay', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('announces the close once for a closed popover across a cover and reveal', async () => {
        const onModalHide = jest.fn();

        const screenCover = renderScreenWithCover(
            <PopoverWithoutOverlay
                isVisible={false}
                anchorRef={anchorRef}
                withoutOverlayRef={withoutOverlayRef}
                onModalHide={onModalHide}
            >
                <Text testID="popover-content">content</Text>
            </PopoverWithoutOverlay>,
        );
        expect(onModalHide).toHaveBeenCalledTimes(1);
        expect(onModalDidClose).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();

        expect(onModalHide).toHaveBeenCalledTimes(1);
        expect(onModalDidClose).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });

    it('announces the open once for a visible popover across a cover and reveal', async () => {
        const onModalShow = jest.fn();

        const screenCover = renderScreenWithCover(
            <PopoverWithoutOverlay
                isVisible
                anchorRef={anchorRef}
                withoutOverlayRef={withoutOverlayRef}
                onModalShow={onModalShow}
                onClose={jest.fn()}
            >
                <Text testID="popover-content">content</Text>
            </PopoverWithoutOverlay>,
        );
        expect(onModalShow).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();

        expect(onModalShow).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });

    it('keeps the close handler registered for a visible popover after a reveal', async () => {
        const screenCover = renderScreenWithCover(
            <PopoverWithoutOverlay
                isVisible
                anchorRef={anchorRef}
                withoutOverlayRef={withoutOverlayRef}
                onClose={jest.fn()}
            >
                <Text testID="popover-content">content</Text>
            </PopoverWithoutOverlay>,
        );
        expect(setCloseModal).toHaveBeenCalledTimes(1);

        await screenCover.hide();
        await screenCover.reveal();

        // The cover unregisters the handler, so the reveal has to register it again or Escape closes nothing.
        expect(setCloseModal).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 2 : 1);
        screenCover.unmount();
    });
});
