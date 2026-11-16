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

let mockAnchorPosition: PopoverAnchorPosition | undefined;

jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1000, windowHeight: 600}));

jest.mock('@components/Popover', () => {
    const MockPopover = ({anchorPosition, children}: {anchorPosition: PopoverAnchorPosition; children: ReactNode}) => {
        mockAnchorPosition = anchorPosition;
        return children;
    };
    return MockPopover;
});

/** Renders the popover with static dimensions and returns the anchor position it passes to `Popover` */
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
            // Given an anchor 450px down a 600px window, which leaves room for the 400px popover above it
            const anchorY = 450;

            // When the popover opens above the anchor
            const position = renderPopoverAt(anchorY, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);

            // Then its bottom edge sits on the anchor, so it ends right above the cell instead of covering it
            expect(position?.bottom).toBe(WINDOW_HEIGHT - anchorY);
        });

        it('caps the popover so its top edge stays inside the window when it does not fit above the anchor', () => {
            // Given an anchor with only 300px of space above it, where pinning the bottom edge would push the top 100px off-screen
            const anchorY = 300;

            // When the popover opens above the anchor
            const position = renderPopoverAt(anchorY, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);

            // Then it moves down just enough to keep its top edge on-screen, because a clipped top would hide content
            expect(position?.bottom).toBe(WINDOW_HEIGHT - POPOVER_HEIGHT);
        });

        it('keeps `windowMargin` of breathing room from the window edge when clamped', () => {
            // Given an anchor with too little space above it, so the popover has to be clamped inside the window
            const anchorY = 300;

            // When the popover opens above the anchor with a window margin
            const position = renderPopoverAt(anchorY, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM, WINDOW_MARGIN);

            // Then it keeps that margin from the top edge, matching the gap the shrinking pickers leave
            expect(position?.bottom).toBe(WINDOW_HEIGHT - POPOVER_HEIGHT - WINDOW_MARGIN);
        });

        it('does not add breathing room when the popover already fits above the anchor', () => {
            // Given an anchor with enough space above it for the whole popover
            const anchorY = 450;

            // When the popover opens above the anchor with a window margin
            const position = renderPopoverAt(anchorY, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM, WINDOW_MARGIN);

            // Then it stays pinned to the anchor, because the margin only applies when the popover is clamped
            expect(position?.bottom).toBe(WINDOW_HEIGHT - anchorY);
        });
    });

    describe('TOP alignment (popover opens below the anchor)', () => {
        it('places the popover top edge at the anchor when it fits below', () => {
            // Given an anchor 100px down, which leaves room for the whole popover below it
            const anchorY = 100;

            // When the popover opens below the anchor
            const position = renderPopoverAt(anchorY, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);

            // Then its top edge sits on the anchor, so it starts right below the cell
            expect(position?.top).toBe(anchorY);
        });

        it('keeps `windowMargin` of breathing room from the bottom edge when clamped', () => {
            // Given an anchor 500px down, so the 400px popover has to be pulled back up to fit inside the window
            const anchorY = 500;

            // When the popover opens below the anchor with a window margin
            const position = renderPopoverAt(anchorY, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, WINDOW_MARGIN);

            // Then it keeps that margin from the bottom edge instead of sitting flush against it
            expect(position?.top).toBe(WINDOW_HEIGHT - POPOVER_HEIGHT - WINDOW_MARGIN);
        });
    });
});
