/**
 * What hides the Spend table's columns while they scroll beneath its left-pinned region. Plain elements, since every piece of
 * their geometry comes from CSS custom properties, so scrolling and resizing repaint them without a render.
 */
import {canUseScrollTimeline, getScrollTimelineAnimation, SCROLL_X_TRANSLATE} from '@components/Search/pinnedCellStyles';
import {PINNED_KEYFRAMES, PINNED_START_COVER_OPACITY_VARIABLE, PINNED_START_WIDTH_VARIABLE} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import {useLeftPinnedColumns} from '@components/Search/PinnedColumnsContext';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

type PinnedRowCoverProps = {
    /** Whether the row shows its selected background. */
    isSelected?: boolean;

    /** Whether the row shows its hover background. */
    isHovered?: boolean;

    /** Rounds the cover's top corner, for the header row. */
    shouldRoundTop?: boolean;

    /** How far inside the row's edges the cover's parent sits, e.g. inside the row's padding. The header row has none. */
    inset?: {horizontal: number; vertical: number};
};

const NO_INSET = {horizontal: 0, vertical: 0};

// Hidden while the table rests at its start, since nothing is beneath the pins then. The timeline's keyframes override the base opacity.
const COVER_MOTION: React.CSSProperties = canUseScrollTimeline
    ? {...getScrollTimelineAnimation([PINNED_KEYFRAMES.START_TRANSLATE, PINNED_KEYFRAMES.START_COVER]), opacity: 0}
    : {...SCROLL_X_TRANSLATE, opacity: `var(${PINNED_START_COVER_OPACITY_VARIABLE}, 0)`};

const MASK_MOTION: React.CSSProperties = canUseScrollTimeline
    ? {...getScrollTimelineAnimation([PINNED_KEYFRAMES.START_COVER]), opacity: 0}
    : {opacity: `var(${PINNED_START_COVER_OPACITY_VARIABLE}, 0)`};

const COVER_STYLE: React.CSSProperties = {
    position: 'absolute',
    width: `var(${PINNED_START_WIDTH_VARIABLE}, 0px)`,
    // Above the cells scrolling beneath, below the pinned cells.
    zIndex: 1,
    boxSizing: 'border-box',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    // Only the shadow's right side shows, cast onto the columns scrolling beneath, so the pinned region reads as floating above them.
    clipPath: 'inset(0 -100% 0 0)',
    ...COVER_MOTION,
};

/** One cover behind the left-pinned region, spanning the row's full height so rows with an error line under them stay covered too. */
function PinnedRowCover({isSelected = false, isHovered = false, shouldRoundTop = false, inset = NO_INSET}: PinnedRowCoverProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const leftPinned = useLeftPinnedColumns();

    if (leftPinned.length === 0) {
        return null;
    }

    // The same backgrounds the row paints for these states.
    let rowBackground = styles.highlightBG;
    if (isSelected) {
        rowBackground = styles.activeComponentBG;
    } else if (isHovered) {
        rowBackground = styles.hoveredComponentBG;
    }

    return (
        <div
            aria-hidden
            style={{
                ...COVER_STYLE,
                top: -inset.vertical,
                bottom: -inset.vertical,
                left: -inset.horizontal,
                backgroundColor: rowBackground.backgroundColor,
                borderRightColor: theme.border,
                boxShadow: theme.shadow,
                borderTopLeftRadius: shouldRoundTop ? variables.componentBorderRadius : 0,
            }}
        />
    );
}

type PinnedGutterMaskProps = {
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
function PinnedGutterMask({gutterWidth}: PinnedGutterMaskProps) {
    const styles = useThemeStyles();
    const leftPinned = useLeftPinnedColumns();

    if (leftPinned.length === 0) {
        return null;
    }

    return (
        <div
            aria-hidden
            style={{...MASK_STYLE, ...styles.appBG, width: gutterWidth}}
        />
    );
}

export {PinnedRowCover, PinnedGutterMask};
