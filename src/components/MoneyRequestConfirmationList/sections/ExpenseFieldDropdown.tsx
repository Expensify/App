import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef, ReactNode} from 'react';
import type {View} from 'react-native';

import React, {useRef, useState} from 'react';

import type {ExpenseFieldRowProps} from './ExpenseFieldRow';

import ExpenseFieldRow from './ExpenseFieldRow';

/** Gap between the row and the container it opens, so the container reads as attached to the row without touching it */
const CONTAINER_GAP = 4;

/** How many options the container shows before the list starts scrolling */
const MAX_VISIBLE_OPTIONS = 4;

/** Height the search input takes when the list is long enough to show one */
const SEARCH_INPUT_HEIGHT = 64;

/** Vertical padding the container draws around its list */
const CONTENT_VERTICAL_PADDING = 32;

/**
 * Tallest the container may be: `MAX_VISIBLE_OPTIONS` rows plus the chrome around them. One row shorter than
 * `CONST.POPOVER_DROPDOWN_MAX_HEIGHT`, because a row inside an RHP shares its panel with the container rather
 * than having the whole window to open into.
 */
const MAX_CONTAINER_HEIGHT = MAX_VISIBLE_OPTIONS * variables.optionRowHeight + SEARCH_INPUT_HEIGHT + CONTENT_VERTICAL_PADDING;

/** The container's own border, which sits outside the height it is given */
const CONTAINER_BORDER = 2;

/**
 * Least room a side needs before the container will open into it: one option, plus the search input and padding
 * around it. With less than this the row falls back to its full-page selector, rather than opening a container
 * too short to hold anything — which, having no height to hold it to, would size itself to its content and be
 * dragged back over the row to fit the window.
 */
const MIN_USABLE_HEIGHT = variables.optionRowHeight + SEARCH_INPUT_HEIGHT + CONTENT_VERTICAL_PADDING;

const ANCHOR_ALIGNMENT_BELOW: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

const ANCHOR_ALIGNMENT_ABOVE: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

/** Where and how big the container is, measured off the row each time it opens */
type DropdownLayout = {
    horizontal: number;
    vertical: number;
    width: number;
    height: number;
    shouldOpenAbove: boolean;
};

type ExpenseFieldDropdownRenderProps = {
    /** Whether the container is open */
    isVisible: boolean;

    /** Dismisses the container: the backdrop, `Escape` and the system back affordance all land here */
    onClose: () => void;

    /** Where the container is pinned, in window coordinates */
    anchorPosition: {horizontal: number; vertical: number};

    /** Which corner of the container `anchorPosition` names, which is how it flips above the row */
    anchorAlignment: AnchorAlignment;

    /** False once the container opens above the row, where it is positioned from its bottom edge instead */
    shouldMeasureAnchorPositionFromTop: boolean;

    /**
     * Always false: the side is already chosen here, off the row's own measurements. Left to its own devices the
     * pop-over shifts itself by a whole pop-over height when it thinks it overflows, which lands the list on top
     * of the row it belongs to.
     */
    shouldSwitchPositionIfOverflow: false;

    /** Width of the row, which the container matches on a wide layout */
    popoverWidth: number;

    /** Tallest the container may be without running off the viewport */
    popoverHeight: number;
};

type ExpenseFieldDropdownProps = Omit<ExpenseFieldRowProps, 'onPress' | 'anchorRef' | 'isExpanded'> & {
    /**
     * Renders the field's list inside the container. Only called once the row has been pressed at least once, so
     * a list nobody opens costs the form nothing: these lists subscribe widely and build their options eagerly.
     */
    renderDropdown: (props: ExpenseFieldDropdownRenderProps) => ReactNode;

    /**
     * Whether the field's list opens in the container at all. A field that can't answer in place — one that has
     * to send the user through an upgrade or a workspace choice first, or whose list isn't loaded — falls back
     * to `onPress`, which opens the same full page the row opened before.
     */
    shouldOpenInDropdown: boolean;

    /** Opens the field's full-page selector, for every case `shouldOpenInDropdown` rules out */
    onPress: () => void;
};

/**
 * An expense form field whose list opens in a container anchored to the row, rather than on a page of its own.
 *
 * The container is a pop-over on a wide layout and a bottom sheet on a narrow one, which `PopoverWithMeasuredContent`
 * decides on its own. On a wide layout it matches the row's width and opens directly below it, or above it when
 * there isn't room below, and is capped so it is never clipped by the viewport.
 *
 * This owns the container and the row, and nothing about any particular field: each field passes its own list in
 * through `renderDropdown` and keeps the selector page it already had as the fallback for the cases the container
 * can't serve.
 */
function ExpenseFieldDropdown({renderDropdown, shouldOpenInDropdown, onPress, ...rowProps}: ExpenseFieldDropdownProps) {
    const {windowHeight} = useWindowDimensions();
    // The container is a bottom sheet rather than a pop-over below this width, and a sheet is sized by the screen
    // rather than by the row, so none of the measured geometry applies to it.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match the dock decision PopoverWithMeasuredContent makes, which is on isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {contentHeaderHeight} = useContentHeaderHeight();
    const {top: safeAreaTop} = useSafeAreaInsets();
    const anchorRef = useRef<ComponentRef<typeof View> | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    // The list stays mounted after the first open so reopening it is instant, but it is never mounted for a field
    // the user doesn't touch.
    const [hasEverOpened, setHasEverOpened] = useState(false);
    const [layout, setLayout] = useState<DropdownLayout>({
        horizontal: 0,
        vertical: 0,
        width: CONST.POPOVER_DROPDOWN_WIDTH,
        height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
        shouldOpenAbove: false,
    });

    const closeDropdown = () => setIsVisible(false);

    const openDropdown = () => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const spaceBelow = windowHeight - (y + height + CONTAINER_GAP);
            // The page's header holds the back button, so the container stops short of it rather than opening
            // over the way out of the page it belongs to.
            const spaceAbove = y - CONTAINER_GAP - (safeAreaTop + contentHeaderHeight);
            // Below is the default, and it stays the default as long as it can hold the whole container. Only
            // once it can't does the side with more room win, so a row low down in a panel opens upwards into
            // the space it has rather than downwards into a sliver.
            const shouldOpenAbove = spaceBelow < MAX_CONTAINER_HEIGHT && spaceAbove > spaceBelow;
            const availableHeight = (shouldOpenAbove ? spaceAbove : spaceBelow) - CONTAINER_BORDER;

            // Neither side can hold a list worth opening, so the field answers on its own page instead.
            if (availableHeight < MIN_USABLE_HEIGHT) {
                onPress();
                return;
            }

            setLayout({
                horizontal: x,
                vertical: shouldOpenAbove ? y - CONTAINER_GAP : y + height + CONTAINER_GAP,
                width,
                // The space the row leaves is a hard ceiling, never a target: flooring it at a minimum was what
                // let the container run past the panel it opened from when the row sat close to the edge. It is
                // the most the container may take, and the list inside it takes only what its content needs.
                height: Math.min(MAX_CONTAINER_HEIGHT, availableHeight),
                shouldOpenAbove,
            });
            setHasEverOpened(true);
            setIsVisible(true);
        });
    };

    const handlePress = () => {
        if (!shouldOpenInDropdown) {
            onPress();
            return;
        }
        // Pressing the row while its list is open closes it, the same way the backdrop does. On a wide layout the
        // backdrop covers the row, so this only fires where the row is still reachable.
        if (isVisible) {
            closeDropdown();
            return;
        }
        openDropdown();
    };

    return (
        <>
            <ExpenseFieldRow
                {...rowProps}
                anchorRef={shouldOpenInDropdown ? anchorRef : undefined}
                isExpanded={shouldOpenInDropdown ? isVisible : undefined}
                onPress={handlePress}
            />
            {hasEverOpened &&
                renderDropdown({
                    isVisible,
                    onClose: closeDropdown,
                    anchorPosition: {horizontal: layout.horizontal, vertical: layout.vertical},
                    anchorAlignment: layout.shouldOpenAbove ? ANCHOR_ALIGNMENT_ABOVE : ANCHOR_ALIGNMENT_BELOW,
                    shouldMeasureAnchorPositionFromTop: !layout.shouldOpenAbove,
                    shouldSwitchPositionIfOverflow: false,
                    popoverWidth: isSmallScreenWidth ? CONST.POPOVER_DROPDOWN_WIDTH : layout.width,
                    popoverHeight: isSmallScreenWidth ? CONST.POPOVER_DROPDOWN_MAX_HEIGHT : layout.height,
                })}
        </>
    );
}

export default ExpenseFieldDropdown;
export type {ExpenseFieldDropdownRenderProps};
