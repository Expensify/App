import {render} from '@testing-library/react-native';

import React, {useRef} from 'react';

const mockLogWarn = jest.fn();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        warn: (...args: unknown[]) => {
            mockLogWarn(...args);
        },
        info: jest.fn(),
        alert: jest.fn(),
        hmmm: jest.fn(),
        client: jest.fn(),
    },
}));

const {default: useAccessibilityFocus} = require<{
    default: (params: {didScreenTransitionEnd: boolean; isFocused: boolean; ref: React.RefObject<HTMLElement | null>; shouldMoveAccessibilityFocus?: boolean}) => void;
}>('../../src/hooks/useAccessibilityFocus/index.ts');
const {resetCycle, tryClaim, Priorities, isCycleIdle} = require<{
    resetCycle: () => void;
    tryClaim: (priority: 1 | 2 | 3) => boolean;
    Priorities: {INITIAL: 1; AUTO: 2; RETURN: 3};
    isCycleIdle: () => boolean;
}>('../../src/libs/ScreenFocusArbiter.ts');

function makeContainer(): {container: HTMLElement; button: HTMLButtonElement} {
    const container = document.createElement('div');
    const button = document.createElement('button');
    container.appendChild(button);
    document.body.appendChild(container);
    return {container, button};
}

function Harness({
    container,
    isFocused,
    didScreenTransitionEnd,
    shouldMoveAccessibilityFocus = true,
}: {
    container: HTMLElement | null;
    isFocused: boolean;
    didScreenTransitionEnd: boolean;
    shouldMoveAccessibilityFocus?: boolean;
}) {
    const ref = useRef<HTMLElement | null>(container);
    useAccessibilityFocus({didScreenTransitionEnd, isFocused, ref, shouldMoveAccessibilityFocus});
    return null;
}

beforeEach(() => {
    document.body.innerHTML = '';
    resetCycle();
    mockLogWarn.mockClear();
});

describe('useAccessibilityFocus — arbiter integration', () => {
    it('claims AUTO before focusing so an in-flight RETURN can preempt, then releases so a same-tree sub-modal INITIAL is not blocked', () => {
        const {container, button} = makeContainer();
        const spy = jest.spyOn(button, 'focus');
        render(
            <Harness
                container={container}
                isFocused
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalled();
        expect(tryClaim(Priorities.INITIAL)).toBe(true);
    });

    it('yields to an in-flight RETURN restore', () => {
        const {container, button} = makeContainer();
        tryClaim(Priorities.RETURN);
        const spy = jest.spyOn(button, 'focus');
        render(
            <Harness
                container={container}
                isFocused
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('releases the cycle when no target accepts focus, so a later claim is not held off', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        render(
            <Harness
                container={container}
                isFocused
                didScreenTransitionEnd
            />,
        );
        expect(isCycleIdle()).toBe(true);
    });

    it('does nothing when shouldMoveAccessibilityFocus is false and does not claim the arbiter cycle', () => {
        const {container, button} = makeContainer();
        const spy = jest.spyOn(button, 'focus');
        render(
            <Harness
                container={container}
                isFocused
                didScreenTransitionEnd
                shouldMoveAccessibilityFocus={false}
            />,
        );
        expect(spy).not.toHaveBeenCalled();
        expect(isCycleIdle()).toBe(true);
    });

    it('does nothing until didScreenTransitionEnd is true', () => {
        const {container, button} = makeContainer();
        const spy = jest.spyOn(button, 'focus');
        render(
            <Harness
                container={container}
                isFocused
                didScreenTransitionEnd={false}
            />,
        );
        expect(spy).not.toHaveBeenCalled();
        expect(isCycleIdle()).toBe(true);
    });

    it('releases the AUTO cycle and logs (rather than escalating) when focus() throws on a stale node', () => {
        const {container, button} = makeContainer();
        jest.spyOn(button, 'focus').mockImplementation(() => {
            throw new Error('detached element');
        });

        expect(() =>
            render(
                <Harness
                    container={container}
                    isFocused
                    didScreenTransitionEnd
                />,
            ),
        ).not.toThrow();

        expect(isCycleIdle()).toBe(true);
        expect(mockLogWarn).toHaveBeenCalled();
        expect(button.hasAttribute('data-programmatic-focus')).toBe(false);
    });
});
