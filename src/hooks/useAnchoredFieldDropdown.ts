/**
 * Opens a field's list in a container anchored to its row, rather than on its own page. The expense form's bordered
 * fields use it through `ExpenseFieldDropdown`, and the push rows of the expense detail view use it directly, so a list
 * opens in the same spot relative to its row on both screens.
 */
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

import {useRef, useState} from 'react';

import useContentHeaderHeight from './useContentHeaderHeight';
import useResponsiveLayout from './useResponsiveLayout';
import useSafeAreaInsets from './useSafeAreaInsets';
import useWindowDimensions from './useWindowDimensions';

/** Gap between the row and the container it opens */
const CONTAINER_GAP = 4;

/** How many options the container shows before the list starts scrolling */
const MAX_VISIBLE_OPTIONS = 4;

/** Tallest the container may be. One option shorter than `CONST.POPOVER_DROPDOWN_MAX_HEIGHT`, since a row in an RHP shares its panel. */
const MAX_CONTAINER_HEIGHT = getSelectionListPopoverContentHeight({optionCount: MAX_VISIBLE_OPTIONS});

/** The container's border, which sits outside the height it is given */
const CONTAINER_BORDER = 2;

/** Least room a side needs to be worth opening into. Below this the row falls back to its full-page selector. */
const MIN_USABLE_HEIGHT = getSelectionListPopoverContentHeight({optionCount: 1});

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

/** What a field's list needs to open in the container anchored to its row */
type AnchoredFieldDropdownRenderProps = {
    /** Whether the container is open */
    isVisible: boolean;

    /** Dismisses the container */
    onClose: () => void;

    /** Where the container is pinned, in window coordinates */
    anchorPosition: {horizontal: number; vertical: number};

    /** Which corner of the container `anchorPosition` names */
    anchorAlignment: AnchorAlignment;

    /** False once the container opens above the row, where it is positioned from its bottom edge instead */
    shouldMeasureAnchorPositionFromTop: boolean;

    /** Always false: the side is chosen here, and letting the pop-over flip again lands it on the row. */
    shouldSwitchPositionIfOverflow: false;

    /** Width of the row, which the container matches on a wide layout */
    popoverWidth: number;

    /** Tallest the container may be without running off the viewport */
    popoverHeight: number;
};

type UseAnchoredFieldDropdownParams = {
    /** Opens the field's full-page selector, for a row left with too little room on either side for the container */
    onFallback: () => void;

    /** Height of a header the list shows above its options, e.g. an add button, added to the container's limits so it still fits as many options */
    listHeaderHeight?: number;
};

type UseAnchoredFieldDropdownResult = {
    /** Goes on the row the container lines up with */
    anchorRef: RefObject<ComponentRef<typeof View> | null>;

    /** Whether the container is open, which the row reports to assistive technology */
    isVisible: boolean;

    /** Whether the row has been opened at least once. The list is mounted from then on, so an untouched row costs the screen nothing. */
    hasEverOpened: boolean;

    /** Opens the container, or closes it when it is already open, as pressing the row again does */
    toggleDropdown: () => void;

    /** What the list's container needs to open in place */
    dropdownProps: AnchoredFieldDropdownRenderProps;
};

function useAnchoredFieldDropdown({onFallback, listHeaderHeight = 0}: UseAnchoredFieldDropdownParams): UseAnchoredFieldDropdownResult {
    const {windowHeight} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision, which is on isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {contentHeaderHeight} = useContentHeaderHeight();
    const {top: safeAreaTop} = useSafeAreaInsets();
    const anchorRef = useRef<ComponentRef<typeof View> | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasEverOpened, setHasEverOpened] = useState(false);
    const [layout, setLayout] = useState<DropdownLayout>({
        horizontal: 0,
        vertical: 0,
        width: CONST.POPOVER_DROPDOWN_WIDTH,
        height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
        shouldOpenAbove: false,
    });

    const maxContainerHeight = MAX_CONTAINER_HEIGHT + listHeaderHeight;
    const minUsableHeight = MIN_USABLE_HEIGHT + listHeaderHeight;

    const closeDropdown = () => setIsVisible(false);

    const openDropdown = () => {
        // A narrow layout docks the container at the bottom of the screen, where the row's position plays no part.
        if (isSmallScreenWidth) {
            setHasEverOpened(true);
            setIsVisible(true);
            return;
        }

        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const spaceBelow = windowHeight - (y + height + CONTAINER_GAP);
            // The screen's header sits over the top of the window, so the container can't open into it.
            const spaceAbove = y - CONTAINER_GAP - (safeAreaTop + contentHeaderHeight);
            const shouldOpenAbove = spaceBelow < maxContainerHeight && spaceAbove > spaceBelow;
            const availableHeight = (shouldOpenAbove ? spaceAbove : spaceBelow) - CONTAINER_BORDER;

            if (availableHeight < minUsableHeight) {
                onFallback();
                return;
            }

            setLayout({
                horizontal: x,
                vertical: shouldOpenAbove ? y - CONTAINER_GAP : y + height + CONTAINER_GAP,
                width,
                height: Math.min(maxContainerHeight, availableHeight),
                shouldOpenAbove,
            });
            setHasEverOpened(true);
            setIsVisible(true);
        });
    };

    const toggleDropdown = () => {
        if (isVisible) {
            closeDropdown();
            return;
        }
        openDropdown();
    };

    return {
        anchorRef,
        isVisible,
        hasEverOpened,
        toggleDropdown,
        dropdownProps: {
            isVisible,
            onClose: closeDropdown,
            anchorPosition: {horizontal: layout.horizontal, vertical: layout.vertical},
            anchorAlignment: layout.shouldOpenAbove ? ANCHOR_ALIGNMENT_ABOVE : ANCHOR_ALIGNMENT_BELOW,
            shouldMeasureAnchorPositionFromTop: !layout.shouldOpenAbove,
            shouldSwitchPositionIfOverflow: false,
            popoverWidth: isSmallScreenWidth ? CONST.POPOVER_DROPDOWN_WIDTH : layout.width,
            popoverHeight: isSmallScreenWidth ? CONST.POPOVER_DROPDOWN_MAX_HEIGHT + listHeaderHeight : layout.height,
        },
    };
}

export default useAnchoredFieldDropdown;
export type {AnchoredFieldDropdownRenderProps};
