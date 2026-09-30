import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef, ReactNode} from 'react';
import type {View} from 'react-native';

import React, {useRef, useState} from 'react';

import type {ExpenseFieldRowProps} from './ExpenseFieldRow';

import ExpenseFieldRow from './ExpenseFieldRow';

/** Gap between the row and the container it opens, so the container reads as attached to the row without touching it */
const CONTAINER_GAP = 4;

/** Below this the container is too short to be worth opening downwards, and it opens above the row instead */
const MIN_CONTAINER_HEIGHT = 180;

/**
 * Tallest the container may be as a share of the window, matching what every other popover in the app is held
 * to. The form the row belongs to can sit inside an RHP, and a container measured only against the window would
 * run past the panel it was opened from.
 */
const MAX_CONTAINER_HEIGHT = CONST.POPOVER_DROPDOWN_MAX_HEIGHT;

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
            const spaceAbove = y - CONTAINER_GAP;
            // Below is the default. The container only flips above the row when below can't hold a usable list and
            // above can hold more of one, so a row near the bottom of a tall form doesn't open into a sliver.
            const shouldOpenAbove = spaceBelow < MIN_CONTAINER_HEIGHT && spaceAbove > spaceBelow;
            const availableHeight = shouldOpenAbove ? spaceAbove : spaceBelow;

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
                    popoverWidth: isSmallScreenWidth ? CONST.POPOVER_DROPDOWN_WIDTH : layout.width,
                    popoverHeight: isSmallScreenWidth ? CONST.POPOVER_DROPDOWN_MAX_HEIGHT : layout.height,
                })}
        </>
    );
}

export default ExpenseFieldDropdown;
export type {ExpenseFieldDropdownRenderProps};
