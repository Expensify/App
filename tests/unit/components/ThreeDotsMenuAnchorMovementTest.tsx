import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';

import React from 'react';
import Onyx from 'react-native-onyx';

type AnchorHarness = {
    button?: HTMLElement;
    measureCount: number;
    anchorPosition: AnchorPosition;
};

function harness(): AnchorHarness {
    const holder = globalThis as typeof globalThis & {threeDotsAnchorHarness?: AnchorHarness};
    holder.threeDotsAnchorHarness ??= {measureCount: 0, anchorPosition: {horizontal: 120, vertical: 80}};
    return holder.threeDotsAnchorHarness;
}

class NotifyingResizeObserver {
    static instances: NotifyingResizeObserver[] = [];

    private readonly targets = new Set<Element>();

    constructor(private readonly callback: ResizeObserverCallback) {
        NotifyingResizeObserver.instances.push(this);
    }

    observe(target: Element) {
        this.targets.add(target);
    }

    unobserve(target: Element) {
        this.targets.delete(target);
    }

    disconnect() {
        this.targets.clear();
    }

    static notify(target: Element) {
        for (const instance of NotifyingResizeObserver.instances) {
            if (!instance.targets.has(target)) {
                continue;
            }
            instance.callback([], instance as unknown as ResizeObserver);
        }
    }

    static isWatching(target: Element): boolean {
        return NotifyingResizeObserver.instances.some((instance) => instance.targets.has(target));
    }
}

jest.mock('@components/Pressable/PressableWithoutFeedback', () => {
    const ReactActual = require<typeof import('react')>('react');
    const {Pressable} = require<typeof import('react-native')>('react-native');

    return ReactActual.forwardRef(function MockPressable(props: {testID?: string; onPress?: () => void; accessibilityLabel?: string}, ref: React.Ref<HTMLElement | null>) {
        const button = ReactActual.useRef<HTMLButtonElement | null>(null);
        if (!button.current && typeof global.document !== 'undefined') {
            button.current = global.document.createElement('button');
            global.document.body.appendChild(button.current);
            const state = (globalThis as typeof globalThis & {threeDotsAnchorHarness?: AnchorHarness}).threeDotsAnchorHarness;
            if (state && button.current) {
                state.button = button.current;
            }
        }
        ReactActual.useImperativeHandle(ref, () => button.current);
        return (
            <Pressable
                testID={props.testID}
                onPress={props.onPress}
                accessibilityLabel={props.accessibilityLabel}
            />
        );
    });
});

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: () => {
        const state = (globalThis as typeof globalThis & {threeDotsAnchorHarness?: AnchorHarness}).threeDotsAnchorHarness;
        if (state) {
            state.measureCount += 1;
        }
        return Promise.resolve({...(state?.anchorPosition ?? {horizontal: 0, vertical: 0})});
    },
}));

jest.mock('@components/PopoverMenu', () => {
    function MockPopoverMenu({anchorPosition}: {anchorPosition?: AnchorPosition}) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module
        const {Text: RNText} = require<typeof import('react-native')>('react-native');
        return <RNText testID="three-dots-anchor-horizontal">{anchorPosition?.horizontal ?? ''}</RNText>;
    }
    return MockPopoverMenu;
});

const MENU_ITEMS = [{text: 'Details', onSelected: () => {}, sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL}];

function setRect(element: HTMLElement, left: number, top: number) {
    element.getBoundingClientRect = () =>
        ({
            left,
            top,
            width: 24,
            height: 24,
            right: left + 24,
            bottom: top + 24,
            x: left,
            y: top,
            toJSON: () => ({}),
        }) as DOMRect;
}

function renderMenu() {
    return render(
        <ThreeDotsMenu
            shouldSelfPosition
            testID="three-dots-button"
            menuItems={MENU_ITEMS}
        />,
    );
}

describe('ThreeDotsMenu anchor movement', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        global.ResizeObserver = NotifyingResizeObserver as unknown as typeof ResizeObserver;
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });
        jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    beforeEach(async () => {
        jest.useFakeTimers();
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });
        NotifyingResizeObserver.instances = [];
        harness().measureCount = 0;
        harness().anchorPosition = {horizontal: 120, vertical: 80};
        harness().button = undefined;
        await Onyx.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    async function openMenu() {
        const view = renderMenu();
        const button = harness().button;
        if (!button) {
            throw new Error('Expected the menu button to be a DOM element so the anchor observer can attach');
        }
        setRect(button, 10, 20);
        await act(async () => {
            fireEvent.press(screen.getByTestId('three-dots-button'));
        });
        expect(screen.getByText('120')).toBeTruthy();
        return {view, button};
    }

    it('remeasures when a parent resizes and the button rectangle moves', async () => {
        // Given an open menu whose button has not moved yet
        const {button} = await openMenu();
        const parent = button.parentElement;
        if (!parent) {
            throw new Error('Expected the button to have a parent for the anchor observer');
        }
        const measuresAfterOpen = harness().measureCount;

        // When an ancestor reports a size change and the button's window rect has moved, with no window-size change
        setRect(button, 180, 20);
        harness().anchorPosition = {horizontal: 480, vertical: 80};
        await act(async () => {
            NotifyingResizeObserver.notify(parent);
        });

        // Then the popup follows the button, because FlashList moves the row by resizing a parent
        expect(screen.getByText('480')).toBeTruthy();
        expect(harness().measureCount).toBe(measuresAfterOpen + 1);
    });

    it('does not remeasure when a parent resizes but the button rectangle stays put', async () => {
        // Given an open menu
        const {button} = await openMenu();
        const parent = button.parentElement;
        if (!parent) {
            throw new Error('Expected the button to have a parent for the anchor observer');
        }
        const measuresAfterOpen = harness().measureCount;

        // When an ancestor resizes without moving the button
        harness().anchorPosition = {horizontal: 480, vertical: 80};
        act(() => {
            NotifyingResizeObserver.notify(parent);
        });

        // Then the menu skips the measurement, so an unchanged rect cannot loop
        expect(screen.getByText('120')).toBeTruthy();
        expect(screen.queryByText('480')).toBeNull();
        expect(harness().measureCount).toBe(measuresAfterOpen);
    });

    it('disconnects the observer when the menu closes', async () => {
        // Given an open menu watching its parents
        const {button} = await openMenu();
        const parent = button.parentElement;
        if (!parent) {
            throw new Error('Expected the button to have a parent for the anchor observer');
        }
        expect(NotifyingResizeObserver.isWatching(parent)).toBe(true);

        // When the menu closes
        fireEvent.press(screen.getByTestId('three-dots-button'));
        const measuresAfterClose = harness().measureCount;
        setRect(button, 180, 20);
        harness().anchorPosition = {horizontal: 480, vertical: 80};
        act(() => {
            NotifyingResizeObserver.notify(parent);
        });

        // Then a later parent resize does not measure, because the observer was disconnected
        expect(NotifyingResizeObserver.isWatching(parent)).toBe(false);
        expect(harness().measureCount).toBe(measuresAfterClose);
        expect(screen.queryByText('480')).toBeNull();
    });
});
