import {act, render} from '@testing-library/react-native';

import PopoverContextProvider, {usePopoverActions} from '@components/PopoverProvider';
import type * as PopoverProviderWeb from '@components/PopoverProvider/index';
import type {AnchorRef, AnchorType} from '@components/PopoverProvider/types';

import {setCloseModal} from '@userActions/Modal';

import React, {useEffect, useRef} from 'react';

// These guards are document listeners, which only the web provider has. Jest resolves the native variant by default.
jest.mock('@components/PopoverProvider', () => jest.requireActual<typeof PopoverProviderWeb>('@components/PopoverProvider/index.tsx'));

type OpenPopoverProps = {
    close: () => void;
    shouldCloseOnWheel?: boolean;
};

/** Opens a popover through the provider the way a real one does, so the document listeners have something to act on */
function OpenPopover({close, shouldCloseOnWheel}: OpenPopoverProps) {
    const {onOpen} = usePopoverActions();
    const anchorRef = useRef<AnchorType>(null);
    const ref = useRef<AnchorType>(null);

    useEffect(() => {
        const popover: AnchorRef = {ref, anchorRef, close};
        onOpen(shouldCloseOnWheel === undefined ? popover : {...popover, shouldCloseOnWheel});
    }, [close, onOpen, shouldCloseOnWheel]);

    return null;
}

function openPopover(props: OpenPopoverProps) {
    return render(
        <PopoverContextProvider>
            <OpenPopover
                close={props.close}
                shouldCloseOnWheel={props.shouldCloseOnWheel}
            />
        </PopoverContextProvider>,
    );
}

function pressEscape() {
    act(() => {
        document.dispatchEvent(new KeyboardEvent('keyup', {key: 'Escape'}));
    });
}

function scroll() {
    act(() => {
        document.dispatchEvent(new Event('wheel'));
    });
}

describe('PopoverProvider guards', () => {
    describe('escape', () => {
        it('closes a popover that is the topmost thing on screen', () => {
            // Given an open popover whose close is the one escape is meant to reach
            const close = jest.fn();
            openPopover({close});
            const unregister = setCloseModal(close);

            // When escape is pressed
            pressEscape();

            // Then the popover closes, which is what the key is for
            expect(close).toHaveBeenCalledTimes(1);
            unregister();
        });

        it('leaves the popover alone while a modal is open above it', () => {
            // Given a popover with a modal opened from its own content sitting above it
            const close = jest.fn();
            const closeModalAbove = jest.fn();
            openPopover({close});
            const unregisterPopover = setCloseModal(close);
            const unregisterModal = setCloseModal(closeModalAbove);

            // When escape is pressed, which this listener sees before the modal does
            pressEscape();

            // Then the popover stays, since closing it would take the modal rendered inside it away too
            expect(close).not.toHaveBeenCalled();
            unregisterModal();
            unregisterPopover();
        });

        it('closes the popover again once the modal above it has gone', () => {
            // Given a modal that was opened above the popover and then closed
            const close = jest.fn();
            const closeModalAbove = jest.fn();
            openPopover({close});
            const unregisterPopover = setCloseModal(close);
            const unregisterModal = setCloseModal(closeModalAbove);
            unregisterModal();

            // When escape is pressed
            pressEscape();

            // Then it reaches the popover, which is topmost again
            expect(close).toHaveBeenCalledTimes(1);
            unregisterPopover();
        });
    });

    describe('scrolling', () => {
        it('dismisses a popover that cannot follow its anchor', () => {
            // Given an open popover that has not asked to stay put
            const close = jest.fn();
            openPopover({close});

            // When the page is scrolled
            scroll();

            // Then it is dismissed, since it would otherwise be left behind by its anchor
            expect(close).toHaveBeenCalledTimes(1);
        });

        it('keeps a popover that follows its anchor', () => {
            // Given a popover that keeps itself attached to its anchor, such as the calendar beside a date being typed
            const close = jest.fn();
            openPopover({close, shouldCloseOnWheel: false});

            // When the page is scrolled
            scroll();

            // Then it stays, so scrolling does not interrupt an edit in progress
            expect(close).not.toHaveBeenCalled();
        });
    });
});
