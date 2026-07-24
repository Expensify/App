import {render} from '@testing-library/react-native';

import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import React, {useMemo} from 'react';

let mockHasHoverSupport = true;
jest.mock('@libs/DeviceCapabilities/hasHoverSupport', () => ({
    __esModule: true,
    default: () => mockHasHoverSupport,
}));

let mockScreenReaderState: 'enabled' | 'disabled' | 'unknown' = 'enabled';
jest.mock('@libs/Accessibility', () => ({
    __esModule: true,
    default: {
        getScreenReaderState: () => mockScreenReaderState,
        isScreenReaderEnabledSync: () => mockScreenReaderState === 'enabled',
        useScreenReaderStatus: () => mockScreenReaderState === 'enabled',
        useReducedMotion: () => false,
        moveAccessibilityFocus: jest.fn(),
    },
}));

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));
jest.mock('@hooks/useIsScreenFocused', () => ({
    __esModule: true,
    default: () => mockIsFocused,
}));

const {default: useScreenInitialFocus} = require<{
    default: (node: HTMLElement | null, options?: {shouldSkip?: boolean; shouldClaimOnlyForScreenReader?: boolean}) => void;
}>('../../src/hooks/useScreenInitialFocus/index.ts');
const {resetCycle: resetArbiter, tryClaim: arbiterClaim, Priorities: arbiterPriorities} = require<{
    resetCycle: () => void;
    tryClaim: (priority: 1 | 2 | 3) => boolean;
    Priorities: {INITIAL: 1; AUTO: 2; RETURN: 3};
}>('../../src/libs/ScreenFocusArbiter.ts');
const {teardownHadTabNavigation, setupHadTabNavigation, resetForTests: resetHadTabNavigation} = require<{
    teardownHadTabNavigation: () => void;
    setupHadTabNavigation: () => void;
    resetForTests: () => void;
}>('../../src/libs/hadTabNavigation.ts');

setupHadTabNavigation();

function simulateTab() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true}));
}
function simulatePointer() {
    document.dispatchEvent(new Event('pointerdown', {bubbles: true}));
}

type HarnessProps = {target: HTMLElement | null; didScreenTransitionEnd: boolean; shouldSkip?: boolean; shouldClaimOnlyForScreenReader?: boolean};

function MountedHarness({target, didScreenTransitionEnd, shouldSkip, shouldClaimOnlyForScreenReader}: HarnessProps) {
    const contextValue = useMemo(() => ({didScreenTransitionEnd, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false}), [didScreenTransitionEnd]);
    return (
        <ScreenWrapperStatusContext.Provider value={contextValue}>
            <Inner
                target={target}
                shouldSkip={shouldSkip}
                shouldClaimOnlyForScreenReader={shouldClaimOnlyForScreenReader}
            />
        </ScreenWrapperStatusContext.Provider>
    );
}
function Inner({target, shouldSkip, shouldClaimOnlyForScreenReader}: {target: HTMLElement | null; shouldSkip?: boolean; shouldClaimOnlyForScreenReader?: boolean}) {
    const options = shouldSkip === undefined && shouldClaimOnlyForScreenReader === undefined ? undefined : {shouldSkip, shouldClaimOnlyForScreenReader};
    useScreenInitialFocus(target, options);
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
    mockScreenReaderState = 'enabled';
    teardownHadTabNavigation();
    resetHadTabNavigation();
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

    it('does NOT focus on desktop mouse modality (hasHoverSupport && !hadTab) when SR is known off — WCAG 2.4.7', () => {
        mockScreenReaderState = 'disabled';
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

    it('DOES focus on desktop mouse modality when SR is enabled — virtual-cursor / JAWS-NVDA orientation', () => {
        mockScreenReaderState = 'enabled';
        simulatePointer();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalled();
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

    it('does NOT focus when the screen is not focused (kept-alive background screen must not steal focus from the active one)', () => {
        mockIsFocused = false;
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).not.toHaveBeenCalled();
        mockIsFocused = true;
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

    it('bails when shouldSkip=true so screens that opt out of post-transition focus', () => {
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
                shouldSkip
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('shouldClaimOnlyForScreenReader=true + SR known-off → bails (keyboard user does not see a ring flash before the screen auto-focuses its own target)', () => {
        mockScreenReaderState = 'disabled';
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
                shouldClaimOnlyForScreenReader
            />,
        );
        expect(spy).not.toHaveBeenCalled();
    });

    it('shouldClaimOnlyForScreenReader=true + SR on → claims (TalkBack/VoiceOver needs back-button orientation while the composer is delayed)', () => {
        mockScreenReaderState = 'enabled';
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
                shouldClaimOnlyForScreenReader
            />,
        );
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
    });

    it('shouldClaimOnlyForScreenReader=false (default) preserves the unconditional claim path so non-chat headers still focus for keyboard users', () => {
        mockScreenReaderState = 'disabled';
        simulateTab();
        const button = makeButton();
        const spy = jest.spyOn(button, 'focus');
        render(
            <MountedHarness
                target={button}
                didScreenTransitionEnd
            />,
        );
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
