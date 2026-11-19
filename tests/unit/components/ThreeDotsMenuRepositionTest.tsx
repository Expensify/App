import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ThreeDotsMenu from '@components/ThreeDotsMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';

import React from 'react';
import Onyx from 'react-native-onyx';

let mockWindowWidth = 1200;
let mockWindowHeight = 800;
let mockAnchorPosition: AnchorPosition = {horizontal: 120, vertical: 80};

type DeferredRefresh = {run?: () => void; wait?: number};

function deferredRefreshState(): DeferredRefresh {
    const holder = globalThis as typeof globalThis & {threeDotsDeferredRefresh?: DeferredRefresh};
    holder.threeDotsDeferredRefresh ??= {};
    return holder.threeDotsDeferredRefresh;
}

jest.mock('@hooks/useWindowDimensions', () => () => ({
    windowWidth: mockWindowWidth,
    windowHeight: mockWindowHeight,
}));

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: () => Promise.resolve({...mockAnchorPosition}),
}));

// Hold the menu's deferred measurement. Calls that pass debounce options keep the real implementation.
type Debounce = (func: () => void, wait: number, options?: Record<string, unknown>) => (() => void) & {cancel: () => void};

jest.mock('lodash/debounce', () => {
    const actual: Debounce = jest.requireActual('lodash/debounce');
    return (func: () => void, wait: number, options?: Record<string, unknown>) => {
        if (options) {
            return actual(func, wait, options);
        }
        const holder = globalThis as typeof globalThis & {threeDotsDeferredRefresh?: DeferredRefresh};
        const state = holder.threeDotsDeferredRefresh ?? {};
        holder.threeDotsDeferredRefresh = state;
        state.wait = wait;
        const debounced = () => {
            state.run = func;
        };
        debounced.cancel = () => {
            state.run = undefined;
        };
        return debounced;
    };
});

// jest.requireActual returns an untyped module, so the mock factory cannot be annotated without an inline import().
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
jest.mock('@components/PopoverMenu', () => {
    const ReactActual = jest.requireActual('react');
    const {Text: RNText} = jest.requireActual('react-native');
    return ({anchorPosition}: {anchorPosition?: AnchorPosition}) => {
        ReactActual.useEffect(() => {
            const holder = globalThis as typeof globalThis & {threeDotsPopoverRenders?: number};
            holder.threeDotsPopoverRenders = (holder.threeDotsPopoverRenders ?? 0) + 1;
        });
        return <RNText testID="three-dots-anchor-horizontal">{anchorPosition?.horizontal ?? ''}</RNText>;
    };
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

const MENU_ITEMS = [{text: 'Details', onSelected: () => {}, sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL}];

function renderMenu() {
    return render(
        <ThreeDotsMenu
            shouldSelfPosition
            testID="three-dots-button"
            menuItems={MENU_ITEMS}
        />,
    );
}

describe('ThreeDotsMenu reposition on resize', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockWindowWidth = 1200;
        mockWindowHeight = 800;
        mockAnchorPosition = {horizontal: 120, vertical: 80};
        const holder = globalThis as typeof globalThis & {threeDotsPopoverRenders?: number};
        holder.threeDotsPopoverRenders = 0;
        const deferredRefresh = deferredRefreshState();
        deferredRefresh.run = undefined;
        deferredRefresh.wait = undefined;
    });

    it('waits to remeasure until the deferred resize callback runs', async () => {
        // Given an open menu whose anchor was measured before the window widened
        const {rerender} = renderMenu();

        fireEvent.press(screen.getByTestId('three-dots-button'));
        expect(await screen.findByText('120')).toBeTruthy();

        // When the window width changes before the deferred measurement runs
        mockWindowWidth = 1500;
        mockAnchorPosition = {horizontal: 480, vertical: 80};
        rerender(
            <ThreeDotsMenu
                shouldSelfPosition
                testID="three-dots-button"
                menuItems={MENU_ITEMS}
            />,
        );

        // Then the popup keeps the old anchor until the debounce fires, because the row width is not ready on the window tick
        expect(deferredRefreshState().wait).toBe(CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        expect(screen.getByText('120')).toBeTruthy();

        await act(async () => {
            deferredRefreshState().run?.();
        });

        expect(await screen.findByText('480')).toBeTruthy();
    });

    it('does not measure while the menu is closed', () => {
        // Given a closed menu, so a window change must not read the anchor
        const {rerender} = renderMenu();

        // When the window widens before the menu is opened
        mockWindowWidth = 1500;
        mockAnchorPosition = {horizontal: 480, vertical: 80};
        rerender(
            <ThreeDotsMenu
                shouldSelfPosition
                testID="three-dots-button"
                menuItems={MENU_ITEMS}
            />,
        );

        // Then no deferred measurement is scheduled
        expect(deferredRefreshState().run).toBeUndefined();
        expect(screen.queryByText('480')).toBeNull();
    });

    it('keeps the same position object when the measured coordinates do not change', async () => {
        // Given an open menu that has already applied a deferred measurement
        const {rerender} = renderMenu();
        fireEvent.press(screen.getByTestId('three-dots-button'));
        expect(await screen.findByText('120')).toBeTruthy();

        mockWindowWidth = 1500;
        mockAnchorPosition = {horizontal: 480, vertical: 80};
        rerender(
            <ThreeDotsMenu
                shouldSelfPosition
                testID="three-dots-button"
                menuItems={MENU_ITEMS}
            />,
        );
        await act(async () => {
            deferredRefreshState().run?.();
        });
        expect(await screen.findByText('480')).toBeTruthy();
        const rendersAfterMove = (globalThis as typeof globalThis & {threeDotsPopoverRenders?: number}).threeDotsPopoverRenders;

        // When the same coordinates are measured again
        await act(async () => {
            deferredRefreshState().run?.();
        });

        // Then the popup does not re-render, because setPosition kept the previous object
        expect((globalThis as typeof globalThis & {threeDotsPopoverRenders?: number}).threeDotsPopoverRenders).toBe(rendersAfterMove);
    });

    it('opens on a runtime where HTMLElement is not defined', async () => {
        // Given stock native, where reading HTMLElement throws, so the observer must not be attached that way
        renderMenu();
        const originalHTMLElement = globalThis.HTMLElement;
        Object.defineProperty(globalThis, 'HTMLElement', {configurable: true, writable: true, value: undefined});

        try {
            // When the menu is opened
            fireEvent.press(screen.getByTestId('three-dots-button'));

            // Then the popup still appears, because the anchor check does not evaluate HTMLElement
            expect(await screen.findByText('120')).toBeTruthy();
        } finally {
            Object.defineProperty(globalThis, 'HTMLElement', {configurable: true, writable: true, value: originalHTMLElement});
        }
    });
});
