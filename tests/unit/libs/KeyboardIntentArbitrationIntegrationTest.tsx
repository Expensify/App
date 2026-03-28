import {render, waitFor} from '@testing-library/react-native';
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import NavigationFocusManager from '@libs/NavigationFocusManager/index.web';

jest.mock('@libs/Log');

type NavigationFocusManagerType = typeof NavigationFocusManager;

type ConsumerEvent = {
    consumer: 'confirm' | 'composer';
    value: boolean;
};

type ConsumerProbeProps = {
    manager: NavigationFocusManagerType;
    onSeen: (event: ConsumerEvent) => void;
};

type ConfirmModalProbeProps = ConsumerProbeProps & {
    isVisible: boolean;
};

type ComposerProbeProps = ConsumerProbeProps & {
    shouldRun: boolean;
};

type ConfirmModalStrictGuardProbeProps = {
    isVisible: boolean;
    manager: NavigationFocusManagerType;
    onSnapshot: (value: boolean | undefined) => void;
};

function dispatchEnterKeydown() {
    const keyEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
    document.dispatchEvent(keyEvent);
}

function ConfirmModalProbe({isVisible, manager, onSeen}: ConfirmModalProbeProps) {
    const prevVisibleRef = useRef(isVisible);

    useLayoutEffect(() => {
        const wasVisible = prevVisibleRef.current;
        if (isVisible && !wasVisible) {
            const wasKeyboard = manager.wasRecentKeyboardInteraction();
            onSeen({consumer: 'confirm', value: wasKeyboard});
            if (wasKeyboard) {
                manager.clearKeyboardInteractionFlag();
            }
        }

        prevVisibleRef.current = isVisible;
    }, [isVisible, manager, onSeen]);

    return null;
}

function ComposerProbe({shouldRun, manager, onSeen}: ComposerProbeProps) {
    useEffect(() => {
        if (!shouldRun) {
            return;
        }

        const wasKeyboard = manager.wasRecentKeyboardInteraction();
        onSeen({consumer: 'composer', value: wasKeyboard});
        if (wasKeyboard) {
            manager.clearKeyboardInteractionFlag();
        }
    }, [shouldRun, manager, onSeen]);

    return null;
}

function ConfirmModalStrictGuardProbe({isVisible, manager, onSnapshot}: ConfirmModalStrictGuardProbeProps) {
    const prevVisibleRef = useRef(isVisible);
    const wasOpenedViaKeyboardRef = useRef<boolean | undefined>(undefined);

    useLayoutEffect(() => {
        const wasVisible = prevVisibleRef.current;
        if (isVisible && !wasVisible) {
            // Mirrors ConfirmModal's StrictMode guard behavior.
            if (wasOpenedViaKeyboardRef.current === undefined) {
                const wasKeyboard = manager.wasRecentKeyboardInteraction();
                wasOpenedViaKeyboardRef.current = wasKeyboard;
                if (wasKeyboard) {
                    manager.clearKeyboardInteractionFlag();
                }
            }
            onSnapshot(wasOpenedViaKeyboardRef.current);
        } else if (!isVisible && wasVisible) {
            wasOpenedViaKeyboardRef.current = undefined;
        }

        prevVisibleRef.current = isVisible;
    }, [isVisible, manager, onSnapshot]);

    return null;
}

function ArbitrationHarness({
    isConfirmVisible,
    shouldRunComposer,
    manager,
    onSeen,
}: {
    isConfirmVisible: boolean;
    shouldRunComposer: boolean;
    manager: NavigationFocusManagerType;
    onSeen: (event: ConsumerEvent) => void;
}) {
    return (
        <>
            <ConfirmModalProbe
                isVisible={isConfirmVisible}
                manager={manager}
                onSeen={onSeen}
            />
            <ComposerProbe
                shouldRun={shouldRunComposer}
                manager={manager}
                onSeen={onSeen}
            />
        </>
    );
}

describe('Keyboard Intent Arbitration Integration', () => {
    beforeEach(() => {
        NavigationFocusManager.destroy();
        NavigationFocusManager.initialize();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        NavigationFocusManager.destroy();
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('should run ConfirmModal layout effect before Composer effect and consume intent first', async () => {
        const events: ConsumerEvent[] = [];
        const onSeen = (event: ConsumerEvent) => events.push(event);

        const {rerender} = render(
            <ArbitrationHarness
                isConfirmVisible={false}
                shouldRunComposer={false}
                manager={NavigationFocusManager}
                onSeen={onSeen}
            />,
        );

        dispatchEnterKeydown();

        rerender(
            <ArbitrationHarness
                isConfirmVisible
                shouldRunComposer
                manager={NavigationFocusManager}
                onSeen={onSeen}
            />,
        );

        await waitFor(() => {
            expect(events).toHaveLength(2);
        });

        expect(events.at(0)).toEqual({consumer: 'confirm', value: true});
        expect(events.at(1)).toEqual({consumer: 'composer', value: false});
    });

    it('should let Composer consume first when it runs in an earlier transition', async () => {
        const events: ConsumerEvent[] = [];
        const onSeen = (event: ConsumerEvent) => events.push(event);

        const {rerender} = render(
            <ArbitrationHarness
                isConfirmVisible={false}
                shouldRunComposer={false}
                manager={NavigationFocusManager}
                onSeen={onSeen}
            />,
        );

        dispatchEnterKeydown();

        // First transition: only composer runs and consumes.
        rerender(
            <ArbitrationHarness
                isConfirmVisible={false}
                shouldRunComposer
                manager={NavigationFocusManager}
                onSeen={onSeen}
            />,
        );

        await waitFor(() => {
            expect(events).toHaveLength(1);
        });
        expect(events.at(0)).toEqual({consumer: 'composer', value: true});

        // Second transition: confirm opens after composer already consumed.
        rerender(
            <ArbitrationHarness
                isConfirmVisible
                shouldRunComposer={false}
                manager={NavigationFocusManager}
                onSeen={onSeen}
            />,
        );

        await waitFor(() => {
            expect(events).toHaveLength(2);
        });
        expect(events.at(1)).toEqual({consumer: 'confirm', value: false});
    });

    it('should preserve ConfirmModal guarded value in StrictMode and never overwrite with false', async () => {
        const snapshots: Array<boolean | undefined> = [];
        const onSnapshot = (value: boolean | undefined) => snapshots.push(value);

        const {rerender} = render(
            <React.StrictMode>
                <ConfirmModalStrictGuardProbe
                    isVisible={false}
                    manager={NavigationFocusManager}
                    onSnapshot={onSnapshot}
                />
            </React.StrictMode>,
        );

        dispatchEnterKeydown();

        rerender(
            <React.StrictMode>
                <ConfirmModalStrictGuardProbe
                    isVisible
                    manager={NavigationFocusManager}
                    onSnapshot={onSnapshot}
                />
            </React.StrictMode>,
        );

        await waitFor(() => {
            expect(snapshots.length).toBeGreaterThan(0);
        });

        expect(snapshots.at(-1)).toBe(true);
        expect(snapshots).not.toContain(false);
    });
});
