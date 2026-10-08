import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef, ReactNode} from 'react';
import type {View} from 'react-native';

import React, {useRef, useState} from 'react';

import type {ExpenseFieldRowProps} from './ExpenseFieldRow';

import ExpenseFieldRow from './ExpenseFieldRow';

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

type ExpenseFieldDropdownRenderProps = {
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

type ExpenseFieldDropdownProps = Omit<ExpenseFieldRowProps, 'onPress' | 'anchorRef' | 'isExpanded'> & {
    /** Renders the field's list. Only called once the row has been pressed, so an untouched field costs the form nothing. */
    renderDropdown: (props: ExpenseFieldDropdownRenderProps) => ReactNode;

    /** Whether the list opens in the container. A field that can't answer in place falls back to `onPress`. */
    shouldOpenInDropdown: boolean;

    /** Opens the field's full-page selector, for every case `shouldOpenInDropdown` rules out */
    onPress: () => void;

    /** Height of a header the list shows above its options, e.g. an add button, added to the container's limits so it still fits as many options */
    listHeaderHeight?: number;
};

/**
 * An expense form field whose list opens in a container anchored to the row, rather than on its own page.
 *
 * `PopoverWithMeasuredContent` makes it a pop-over on a wide layout and a bottom sheet on a narrow one. The
 * pop-over matches the row's width and opens below it, or above when there isn't room, capped so it is never
 * clipped. Knows nothing about any particular field: each passes its own list in through `renderDropdown`.
 */
function ExpenseFieldDropdown({renderDropdown, shouldOpenInDropdown, onPress, listHeaderHeight = 0, ...rowProps}: ExpenseFieldDropdownProps) {
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
        if (isSmallScreenWidth) {
            setHasEverOpened(true);
            setIsVisible(true);
            return;
        }

        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const spaceBelow = windowHeight - (y + height + CONTAINER_GAP);
            const spaceAbove = y - CONTAINER_GAP - (safeAreaTop + contentHeaderHeight);
            const shouldOpenAbove = spaceBelow < maxContainerHeight && spaceAbove > spaceBelow;
            const availableHeight = (shouldOpenAbove ? spaceAbove : spaceBelow) - CONTAINER_BORDER;

            if (availableHeight < minUsableHeight) {
                onPress();
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

    const handlePress = () => {
        if (!shouldOpenInDropdown) {
            onPress();
            return;
        }
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
