import {act, render} from '@testing-library/react-native';

import Modal from '@components/Modal';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

// The modal closes on an Escape `keyup` only on web.
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

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
    dispatchEscape('keydown', init);
    await flush();
}

async function keyup() {
    dispatchEscape('keyup');
    await flush();
    // Every key event is its own task in a browser, so the next one never shares this task.
    await act(async () => {
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
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
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        await keydown();
        await keyup();

        expect(onUpperClose).not.toHaveBeenCalled();
    });

    it('S2 next press after the opening one closes the modal', async () => {
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        await keydown();
        await keyup();
        await keydown();
        await keyup();

        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });

    it('S3 held press with key repeat: the opening release does not close the modal', async () => {
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        await keydown();
        await keydown({repeat: true});
        await keydown({repeat: true});
        await keyup();

        expect(onUpperClose).not.toHaveBeenCalled();
    });

    it('S4 stacked: the press that opens a modal over an open one closes neither', async () => {
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

        await keydown();
        await keyup();

        expect(onUpperClose).not.toHaveBeenCalled();
        expect(onLowerClose).not.toHaveBeenCalled();
    });

    it('S5 a modal opened another way still closes on a single Escape press', async () => {
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

        await keydown();
        await keyup();

        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });

    it('S6 a lost keyup (window blur while held) does not swallow the next press', async () => {
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
            />,
        );

        await keydown();
        window.dispatchEvent(new Event('blur'));
        await flush();
        await keydown();
        await keyup();

        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });

    it('S7 a modal mounted only when shown: the opening release does not close it, the next press does', async () => {
        const onLowerClose = jest.fn();
        const onUpperClose = jest.fn();
        render(
            <Harness
                onLowerClose={onLowerClose}
                onUpperClose={onUpperClose}
                shouldMountUpperOnlyWhenVisible
            />,
        );

        await keydown();
        await keyup();
        expect(onUpperClose).not.toHaveBeenCalled();

        await keydown();
        await keyup();
        expect(onUpperClose).toHaveBeenCalledTimes(1);
    });
});
