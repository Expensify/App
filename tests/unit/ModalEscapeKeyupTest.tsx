import {act, render} from '@testing-library/react-native';

import Modal from '@components/Modal';

import type * as EscapeKeyPress from '@libs/escapeKeyPress/index.web';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

// The modal closes on an Escape `keyup` only on web.
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

// Jest defaults to native resolution; exercise the actual web implementation.
jest.mock('@libs/escapeKeyPress', () => jest.requireActual<typeof EscapeKeyPress>('@libs/escapeKeyPress/index.web'));

type EscapeEventInit = {repeat?: boolean};

function dispatchEscape(type: 'keydown' | 'keyup', {repeat = false}: EscapeEventInit = {}) {
    document.body.dispatchEvent(new KeyboardEvent(type, {key: 'Escape', bubbles: true, cancelable: true, repeat}));
}

async function flush() {
    await act(async () => {
        await Promise.resolve();
    });
}

async function keydown(init?: EscapeEventInit) {
    await act(async () => {
        dispatchEscape('keydown', init);
    });
}

async function keyup() {
    await act(async () => {
        dispatchEscape('keyup');
    });
}

type HarnessProps = {
    isLowerModalInitiallyVisible?: boolean;
    onLowerClose: () => void;
    onUpperClose: () => void;
    shouldMountUpperOnlyWhenVisible?: boolean;
    openUpperRef?: {current: (() => void) | undefined};
};

/** The upper modal opens on an Escape `keydown`, the way `KeyboardShortcut` opens things: a bubble-phase listener on `document`. */
function Harness({isLowerModalInitiallyVisible = false, onLowerClose, onUpperClose, shouldMountUpperOnlyWhenVisible = false, openUpperRef}: HarnessProps) {
    const [isLowerVisible, setIsLowerVisible] = useState(isLowerModalInitiallyVisible);
    const [isUpperVisible, setIsUpperVisible] = useState(false);

    useEffect(() => {
        if (!openUpperRef) {
            return;
        }
        // eslint-disable-next-line no-param-reassign
        openUpperRef.current = () => setIsUpperVisible(true);
    }, [openUpperRef]);

    useEffect(() => {
        if (isUpperVisible || openUpperRef) {
            return;
        }
        const openUpperOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || event.repeat) {
                return;
            }
            setIsUpperVisible(true);
        };
        document.addEventListener('keydown', openUpperOnEscape);
        return () => document.removeEventListener('keydown', openUpperOnEscape);
    }, [isUpperVisible, openUpperRef]);

    return (
        <>
            <Modal
                type={CONST.MODAL.MODAL_TYPE.CONFIRM}
                isVisible={isLowerVisible}
                onClose={() => {
                    onLowerClose();
                    setIsLowerVisible(false);
                }}
            >
                <View />
            </Modal>
            {(!shouldMountUpperOnlyWhenVisible || isUpperVisible) && (
                <Modal
                    type={CONST.MODAL.MODAL_TYPE.CONFIRM}
                    isVisible={isUpperVisible}
                    onClose={() => {
                        onUpperClose();
                        setIsUpperVisible(false);
                    }}
                >
                    <View />
                </Modal>
            )}
        </>
    );
}

describe('Escape keyup against modals opened by an Escape keydown', () => {
    it('S1 short press: the opening release does not close the modal', async () => {
        // Given: Escape opens a mounted but hidden modal.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        // When: The user presses and releases Escape once.
        await keydown();
        await keyup();

        // Then: The release must leave the newly opened modal visible.
        expect(onUpperClose).not.toHaveBeenCalled();
    });

    it('S2 next press after the opening one closes the modal', async () => {
        // Given: Escape opens a modal on the first press.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        // When: The user completes the opening press and then presses Escape again.
        await keydown();
        await keyup();
        await keydown();
        await keyup();

        // Then: Only the second press closes the modal.
        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });

    it('S3 held press with key repeat: the opening release does not close the modal', async () => {
        // Given: Escape opens a modal before the key is released.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        // When: Holding Escape produces repeated keydown events before release.
        await keydown();
        await keydown({repeat: true});
        await keydown({repeat: true});
        await keyup();

        // Then: Repeats belong to the opening press and must not dismiss the modal.
        expect(onUpperClose).not.toHaveBeenCalled();
    });

    it('S4 stacked: the press that opens a modal over an open one closes neither', async () => {
        // Given: A modal is already open below the one Escape will show.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                isLowerModalInitiallyVisible
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );
        await flush();

        // When: Escape opens the upper modal and is released.
        await keydown();
        await keyup();

        // Then: Neither modal may handle the opening release as a dismissal.
        expect(onUpperClose).not.toHaveBeenCalled();
        expect(onLowerClose).not.toHaveBeenCalled();
    });

    it('S5 a modal opened another way still closes on a single Escape press', async () => {
        // Given: The modal is opened without using Escape.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        const openUpperRef: {current: (() => void) | undefined} = {current: undefined};
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
                openUpperRef={openUpperRef}
            />,
        );
        await act(async () => {
            openUpperRef.current?.();
            await Promise.resolve();
        });

        // When: The user presses Escape after the modal has opened.
        await keydown();
        await keyup();

        // Then: That first Escape press must close the modal.
        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });

    it('S6 a lost keyup (window blur while held) does not swallow the next press', async () => {
        // Given: Escape opens the modal, but the window can lose focus while the key is held.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        // When: The release is lost on blur, then a new Escape press reaches the window.
        await keydown();
        window.dispatchEvent(new Event('blur'));
        await flush();
        await keydown();
        await keyup();

        // Then: The missing release must not suppress the new press.
        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });

    it('S7 a modal mounted only when shown: the opening release does not close it, the next press does', async () => {
        // Given: The upper modal is mounted only when Escape opens it.
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
                shouldMountUpperOnlyWhenVisible
            />,
        );

        // When: The user completes the opening press.
        await keydown();
        await keyup();
        // Then: Even a newly attached listener must ignore the opening release.
        expect(onUpperClose).not.toHaveBeenCalled();

        // When: A second Escape press reaches the now visible modal.
        await keydown();
        await keyup();
        // Then: The new press dismisses it normally.
        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });
});
