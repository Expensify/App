/**
 * What hides the Spend table's columns while they scroll beneath its left-pinned region. Plain elements, since every piece of
 * their geometry comes from CSS custom properties, so scrolling and resizing repaint them without a render.
 */
import {canUseScrollTimeline, getScrollTimelineAnimation} from '@components/Search/pinnedCellStyles';
import {PINNED_KEYFRAMES, PINNED_SCROLL_X_VARIABLE, PINNED_START_COVER_OPACITY_VARIABLE, PINNED_START_WIDTH_VARIABLE} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import {usePinnedColumns, usePinnedRow} from '@components/Search/PinnedColumnsContext';

import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';

type PinnedRowCoversProps = {
    /** Rounds the cover's top corner, for the header row. */
    shouldRoundTop?: boolean;

    /** How far inside the row's edges the cover's parent sits, e.g. inside the row's padding. The header row has none. */
    inset?: {horizontal: number; vertical: number};
};

const NO_INSET = {horizontal: 0, vertical: 0};

// Hidden while the table rests at its start, since nothing is beneath the pins then. The timeline's keyframes override the base opacity.
const COVER_MOTION: React.CSSProperties = canUseScrollTimeline
    ? {...getScrollTimelineAnimation([PINNED_KEYFRAMES.START_TRANSLATE, PINNED_KEYFRAMES.START_COVER]), opacity: 0}
    : {transform: `translateX(var(${PINNED_SCROLL_X_VARIABLE}, 0px))`, opacity: `var(${PINNED_START_COVER_OPACITY_VARIABLE}, 0)`};

const MASK_MOTION: React.CSSProperties = canUseScrollTimeline
    ? {...getScrollTimelineAnimation([PINNED_KEYFRAMES.START_COVER]), opacity: 0}
    : {opacity: `var(${PINNED_START_COVER_OPACITY_VARIABLE}, 0)`};

const COVER_STYLE: React.CSSProperties = {
    position: 'absolute',
    // Above the cells scrolling beneath, below the pinned cells.
    zIndex: 1,
    boxSizing: 'border-box',
    ...COVER_MOTION,
};

// Cast onto the columns scrolling beneath, so the pinned region reads as floating above them.
const SHADOW_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '100%',
    width: variables.pinnedColumnShadowWidth,
    pointerEvents: 'none',
};

/** One cover behind the left-pinned region, spanning the row's full height so rows with an error line under them stay covered too. */
function PinnedRowCovers({shouldRoundTop = false, inset = NO_INSET}: PinnedRowCoversProps) {
    const theme = useTheme();
    const {leftPinned} = usePinnedColumns();
    const {isSelected, isHovered} = usePinnedRow();

    if (leftPinned.length === 0) {
        return null;
    }

    let backgroundColor = theme.highlightBG;
    if (isSelected) {
        backgroundColor = theme.activeComponentBG;
    } else if (isHovered) {
        backgroundColor = theme.hoverComponentBG;
    }
    // The theme's shadow is a whole CSS shadow, and its color is all the edge needs.
    const shadowColor = /rgba?\([^)]*\)/.exec(theme.shadow)?.at(0) ?? 'transparent';

    return (
        <div
            aria-hidden
            style={{
                ...COVER_STYLE,
                top: -inset.vertical,
                bottom: -inset.vertical,
                left: -inset.horizontal,
                width: `var(${PINNED_START_WIDTH_VARIABLE}, 0px)`,
                backgroundColor,
                borderRight: `1px solid ${theme.border}`,
                borderTopLeftRadius: shouldRoundTop ? variables.componentBorderRadius : 0,
            }}
        >
            <div style={{...SHADOW_STYLE, background: `linear-gradient(to right, ${shadowColor}, transparent)`}} />
        </div>
    );
}

type PinnedGutterMasksProps = {
    /** The page's margin around the table, which the rows slide into while they scroll. */
    gutterWidth: number;
};

const MASK_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    // Above the scroller beside it, whose rows slide into the margin. The scroller is its own stacking context, so any layer above it will do.
    zIndex: 1,
    pointerEvents: 'none',
    ...MASK_MOTION,
};

/**
 * Keeps the page margin beside the pinned region clear. The rows slide into it while they scroll, and with the region holding
 * still that reads as the table spilling out of its edge.
 */
function PinnedGutterMasks({gutterWidth}: PinnedGutterMasksProps) {
    const theme = useTheme();
    const {leftPinned} = usePinnedColumns();

    if (leftPinned.length === 0) {
        return null;
    }

    return (
        <div
            aria-hidden
            style={{...MASK_STYLE, width: gutterWidth, backgroundColor: theme.appBG}}
        />
    );
}

export {PinnedRowCovers, PinnedGutterMasks};
