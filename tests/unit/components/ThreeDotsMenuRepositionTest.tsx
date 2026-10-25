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

jest.mock('@components/PopoverMenu', () => {
    function MockPopoverMenu({anchorPosition}: {anchorPosition?: AnchorPosition}) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module
        const {Text: RNText} = jest.requireActual('react-native');
        return <RNText testID="three-dots-anchor-horizontal">{anchorPosition?.horizontal ?? ''}</RNText>;
    }
    return MockPopoverMenu;
});

const MENU_ITEMS = [{text: 'Details', onSelected: () => {}}];

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
        const deferredRefresh = deferredRefreshState();
        deferredRefresh.run = undefined;
        deferredRefresh.wait = undefined;
        await Onyx.clear();
    });

    it('waits to remeasure until the deferred resize callback runs', async () => {
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

        expect(deferredRefreshState().wait).toBe(CONST.TIMING.RESIZE_DEBOUNCE_TIME);
        expect(screen.getByText('120')).toBeTruthy();

        await act(async () => {
            deferredRefreshState().run?.();
        });

        expect(await screen.findByText('480')).toBeTruthy();
    });
});
