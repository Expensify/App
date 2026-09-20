import {render} from '@testing-library/react-native';

import type {PopoverAnchorPosition} from '@components/Modal/types';
import PopoverWithMeasuredContentBase from '@components/PopoverWithMeasuredContent/PopoverWithMeasuredContentBase';
import Text from '@components/Text';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {createRef} from 'react';

const WINDOW_HEIGHT = 600;
const POPOVER_HEIGHT = 400;
const POPOVER_WIDTH = 300;
const WINDOW_MARGIN = CONST.MODAL.POPOVER_MENU_PADDING;

// `mock`-prefixed so `jest.mock`'s factory is allowed to reference it.
let mockAnchorPosition: PopoverAnchorPosition | undefined;

jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1000, windowHeight: 600}));

// Capture the anchor position the popover computed, which is the value under test.
jest.mock('@components/Popover', () => {
    const MockPopover = ({anchorPosition, children}: {anchorPosition: PopoverAnchorPosition; children: ReactNode}) => {
        mockAnchorPosition = anchorPosition;
        return children;
    };
    return MockPopover;
});

/**
 * Renders the popover with static dimensions (so no `onLayout` measurement is needed) and returns the anchor position
 * it computed for the underlying `Popover`.
 */
function renderPopoverAt(vertical: number, verticalAlignment: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>, windowMargin?: number): PopoverAnchorPosition | undefined {
    mockAnchorPosition = undefined;
    render(
        <PopoverWithMeasuredContentBase
            isVisible
            onClose={() => {}}
            anchorRef={createRef<View>()}
            anchorPosition={{horizontal: 0, vertical}}
            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: verticalAlignment}}
            popoverDimensions={{height: POPOVER_HEIGHT, width: POPOVER_WIDTH}}
            windowMargin={windowMargin}
        >
            <Text>content</Text>
        </PopoverWithMeasuredContentBase>,
    );
    return mockAnchorPosition;
}

describe('PopoverWithMeasuredContentBase vertical positioning', () => {
    describe('BOTTOM alignment (popover opens above the anchor)', () => {
        it('pins the popover bottom edge to the anchor when the popover fits above it', () => {
            // The anchor sits 450px down a 600px window, so the 400px popover fits in the space above it.
            const position = renderPopoverAt(450, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);

            expect(position?.bottom).toBe(WINDOW_HEIGHT - 450);
        });

        it('caps the popover so its top edge stays inside the window when it does not fit above the anchor', () => {
            // Only 300px of space above the anchor, so pinning the bottom edge would push the top 100px off-screen.
            const position = renderPopoverAt(300, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);

            expect(position?.bottom).toBe(WINDOW_HEIGHT - POPOVER_HEIGHT);
        });

        it('keeps `windowMargin` of breathing room from the window edge when clamped', () => {
            const position = renderPopoverAt(300, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM, WINDOW_MARGIN);

            expect(position?.bottom).toBe(WINDOW_HEIGHT - POPOVER_HEIGHT - WINDOW_MARGIN);
        });

        it('does not add breathing room when the popover already fits above the anchor', () => {
            const position = renderPopoverAt(450, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM, WINDOW_MARGIN);

            expect(position?.bottom).toBe(WINDOW_HEIGHT - 450);
        });
    });

    describe('TOP alignment (popover opens below the anchor)', () => {
        it('places the popover top edge at the anchor when it fits below', () => {
            const position = renderPopoverAt(100, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);

            expect(position?.top).toBe(100);
        });

        it('keeps `windowMargin` of breathing room from the bottom edge when clamped', () => {
            // The anchor is 500px down, so the 400px popover has to be pulled back up to fit inside the window.
            const position = renderPopoverAt(500, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, WINDOW_MARGIN);

            expect(position?.top).toBe(WINDOW_HEIGHT - POPOVER_HEIGHT - WINDOW_MARGIN);
        });
    });
});
