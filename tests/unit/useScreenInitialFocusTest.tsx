import {render} from '@testing-library/react-native';
import React, {useMemo} from 'react';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

let mockHasHoverSupport = true;
jest.mock('@libs/DeviceCapabilities/hasHoverSupport', () => ({
    __esModule: true,
    default: () => mockHasHoverSupport,
}));

/* eslint-disable import/extensions */
const {default: useScreenInitialFocus} = require<{default: (node: HTMLElement | null) => void}>('../../src/hooks/useScreenInitialFocus/index.ts');
const {resetCycle: resetArbiter, tryClaim: arbiterClaim, Priorities: arbiterPriorities} = require<{
    resetCycle: () => void;
    tryClaim: (priority: 1 | 2 | 3) => boolean;
    Priorities: {INITIAL: 1; AUTO: 2; RETURN: 3};
}>('../../src/libs/ScreenFocusArbiter.ts');
const {teardownHadTabNavigation, setupHadTabNavigation} = require<{
    teardownHadTabNavigation: () => void;
    setupHadTabNavigation: () => void;
}>('../../src/libs/hadTabNavigation.ts');
/* eslint-enable import/extensions */

setupHadTabNavigation();

function simulateTab() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true}));
}
function simulatePointer() {
    document.dispatchEvent(new Event('pointerdown', {bubbles: true}));
}

type HarnessProps = {target: HTMLElement | null; didScreenTransitionEnd: boolean};

function MountedHarness({target, didScreenTransitionEnd}: HarnessProps) {
    const contextValue = useMemo(() => ({didScreenTransitionEnd, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false}), [didScreenTransitionEnd]);
    return (
        <ScreenWrapperStatusContext.Provider value={contextValue}>
            <Inner target={target} />
        </ScreenWrapperStatusContext.Provider>
    );
}
function Inner({target}: {target: HTMLElement | null}) {
    useScreenInitialFocus(target);
    return null;
}

function makeButton(): HTMLElement {
    const b = document.createElement('button');
    document.body.appendChild(b);
    jest.spyOn(b, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 40,
        right: 40,
        width: 40,
        height: 40,
        toJSON: () => ({}),
    } as DOMRect);
    return b;
}

beforeEach(() => {
    document.body.innerHTML = '';
    resetArbiter();
    mockHasHoverSupport = true;
    teardownHadTabNavigation();
    setupHadTabNavigation();
});

describe('useScreenInitialFocus', () => {
    it('focuses the ref after didScreenTransitionEnd in keyboard modality (desktop Tab user)', () => {
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
        // Keyboard users must see the ring (WCAG 2.4.7), so it is not suppressed.
        expect(button.getAttribute('data-programmatic-focus')).toBeNull();
    });

    it('focuses the ref on touch-primary devices (no hover) with focusVisible:false, so :focus-visible never matches and no ring shows (WCAG 2.4.7)', () => {
        mockHasHoverSupport = false;
        simulatePointer();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: false});
        expect(button.getAttribute('data-programmatic-focus')).toBeNull();
    });

    it('releases the arbiter cycle when focus silently fails to land (touch), so a later claim is not blocked', () => {
        mockHasHoverSupport = false;
        simulatePointer();
        const button = makeButton();
        // focus() no-ops (e.g. inert / visibility:hidden ancestor), so activeElement never becomes the button.
        jest.spyOn(button, 'focus').mockImplementation(() => {});
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(arbiterClaim(arbiterPriorities.INITIAL)).toBe(true);
    });

    it('does NOT focus on desktop mouse modality (hasHoverSupport && !hadTab) — WCAG 2.4.7', () => {
        simulatePointer();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('does NOT focus until didScreenTransitionEnd is true', () => {
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd={false}
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('does NOT focus when another element already has focus', () => {
        simulateTab();
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('does NOT focus an off-screen ref (Growl-style transformed Pressable)', () => {
        simulateTab();
        const offscreen = document.createElement('div');
        offscreen.setAttribute('tabindex', '0');
        document.body.appendChild(offscreen);
        jest.spyOn(offscreen, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: -255,
            top: -255,
            left: 0,
            bottom: -195,
            right: 350,
            width: 350,
            height: 60,
            toJSON: () => ({}),
        } as DOMRect);
        const spy = jest.spyOn(offscreen, 'focus');
        render(
            <MountedHarness
                target={offscreen}
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('defers to a higher-priority arbiter claim (RETURN restore wins over screen-mount INITIAL)', () => {
        simulateTab();
        arbiterClaim(arbiterPriorities.RETURN);
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('claims focus when the target attaches after transition end (skeleton → real header, Suspense, conditional render)', () => {
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        const {rerender} = render(
            <MountedHarness
                target={null}
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();

        rerender(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
    });

    it('is one-shot per mount — re-renders with the same ref do not re-claim', () => {
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        const {rerender} = render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalledTimes(1);
        rerender(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
