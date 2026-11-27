/** Hides the columns scrolling beneath the left pins. Styled from CSS variables, so scrolling repaints it without a render. */
import {getPinnedInset} from '@components/Search/pinnedCellStyles';
import {
    PINNED_GUTTER_MASK_VISIBILITY_VARIABLE,
    PINNED_LEFT_EDGE_VARIABLE,
    PINNED_SCROLLBAR_HEIGHT_VARIABLE,
    PINNED_START_EDGE_OPACITY_VARIABLE,
    PINNED_START_WIDTH_VARIABLE,
} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import {useLeftPinnedColumns, useShouldHoldPins} from '@components/Search/PinnedColumnsContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';

type PinnedRowCoverProps = {
    isSelected?: boolean;

    isHovered?: boolean;

    shouldRoundTop?: boolean;

    /** How far inside the row's edges the cover's parent lays it out, e.g. inside the row's padding. */
    inset?: {horizontal: number; vertical: number};
};

const NO_INSET = {horizontal: 0, vertical: 0};

/** A sticky box sticks only within its parent, so the cover hangs off a zero-width rail that sticks while the row stretches it. */
const RAIL_STYLE: React.CSSProperties = {
    position: 'sticky',
    alignSelf: 'stretch',
    width: 0,
    flexShrink: 0,
    // Above the cells scrolling beneath, below the pinned cells.
    zIndex: 1,
};

// Keeps the columns scrolled beneath the pins from being hovered or pressed.
const COVER_STYLE: React.CSSProperties = {
    position: 'absolute',
    width: `var(${PINNED_START_WIDTH_VARIABLE}, 0px)`,
    boxSizing: 'border-box',
};

// The cover matches the row's background, so nothing shows through while the divider waits a frame.
const EDGE_STYLE: React.CSSProperties = {
    ...COVER_STYLE,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    opacity: `var(${PINNED_START_EDGE_OPACITY_VARIABLE}, 0)`,
    clipPath: 'inset(0 -100% 0 0)',
};

/** One cover behind the pinned region, spanning the row's full height. */
function PinnedRowCover({isSelected = false, isHovered = false, shouldRoundTop = false, inset = NO_INSET}: PinnedRowCoverProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const shouldHoldPins = useShouldHoldPins();

    // Nothing scrolls beneath pins that aren't held.
    if (!shouldHoldPins) {
        return null;
    }

    const {backgroundColor: stateBackgroundColor} = StyleUtils.getItemBackgroundColorStyle(isSelected, isHovered, false, theme.activeComponentBG, theme.hoverComponentBG);
    // Every theme color is a CSS string.
    const rowBackgroundColor = typeof stateBackgroundColor === 'string' ? stateBackgroundColor : theme.highlightBG;

    const boxStyle: React.CSSProperties = {
        top: -inset.vertical,
        bottom: -inset.vertical,
        left: -inset.horizontal,
        borderTopLeftRadius: shouldRoundTop ? variables.componentBorderRadius : 0,
    };

    return (
        <div
            aria-hidden
            // The rail rests `inset.horizontal` inside the row's edge, so that's where it has to stick.
            style={{...RAIL_STYLE, left: getPinnedInset(`var(${PINNED_LEFT_EDGE_VARIABLE}, 0px) + ${inset.horizontal}px`)}}
        >
            <div style={{...COVER_STYLE, ...boxStyle, backgroundColor: rowBackgroundColor}} />
            <div style={{...EDGE_STYLE, ...boxStyle, borderRightColor: theme.border, boxShadow: theme.shadow}} />
        </div>
    );
}

type PinnedGutterMaskProps = {
    gutterWidth: number;
};

const MASK_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    // Stops above the horizontal scrollbar, so it stays visible and usable.
    bottom: `var(${PINNED_SCROLLBAR_HEIGHT_VARIABLE}, 0px)`,
    left: 0,
    // Above the scroller, whose rows slide into the margin.
    zIndex: 1,
    // Lets wheel scrolling and the scrollbar under the margin reach the table's scroller.
    pointerEvents: 'none',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a CSS variable holds the value, which csstype's keyword union doesn't model
    visibility: `var(${PINNED_GUTTER_MASK_VISIBILITY_VARIABLE}, hidden)` as React.CSSProperties['visibility'],
};

/** Masks the page margin the rows slide into while they scroll. */
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
