import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef, ReactNode, Ref} from 'react';
import type {View} from 'react-native';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';

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

    /** Opens the full-page selector in place of the list on a phone in landscape. That page must close itself once the phone is back in portrait, so the list can reopen here. */
    onLandscapePress: () => void;

    /** Lets the field open its list without a press, e.g. once the user is back from a step the press sent them to */
    ref?: Ref<ExpenseFieldDropdownHandle>;
};

/** idle → departing (full page opened for landscape) → away (form left for it) → idle (form focused again) */
type LandscapeStep = 'idle' | 'departing' | 'away';

type ExpenseFieldDropdownHandle = {
    /** Opens the list as a press would, falling back to `onPress` when it can't open in place. Does nothing if it is already open. */
    open: () => void;
};

/**
 * An expense form field whose list opens in a container anchored to the row, rather than on its own page.
 *
 * `PopoverWithMeasuredContent` makes it a pop-over on a wide layout and a bottom sheet on a narrow one. The
 * pop-over matches the row's width and opens below it, or above when there isn't room, capped so it is never
 * clipped. A phone in landscape has no room for either, so it opens the full-page selector instead, including when
 * the phone is turned while the sheet is open. Knows nothing about any particular field: each passes its own list in
 * through `renderDropdown`.
 */
function ExpenseFieldDropdown({renderDropdown, shouldOpenInDropdown, onPress, onLandscapePress, ref, ...rowProps}: ExpenseFieldDropdownProps) {
    const {windowHeight} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision, which is on isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {contentHeaderHeight} = useContentHeaderHeight();
    const {top: safeAreaTop} = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const anchorRef = useRef<ComponentRef<typeof View> | null>(null);
    const landscapeStepRef = useRef<LandscapeStep>('idle');
    const [isVisible, setIsVisible] = useState(false);
    const [hasEverOpened, setHasEverOpened] = useState(false);
    const [layout, setLayout] = useState<DropdownLayout>({
        horizontal: 0,
        vertical: 0,
        width: CONST.POPOVER_DROPDOWN_WIDTH,
        height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
        shouldOpenAbove: false,
    });

    const closeDropdown = () => setIsVisible(false);

    const openPageForLandscape = () => {
        landscapeStepRef.current = 'departing';
        onLandscapePress();
    };

    // Turned to landscape with the sheet open: hide the sheet and hand over to the full page, as a press in landscape would.
    const shouldHandOverToPage = isVisible && isInLandscapeMode;

    useEffect(() => {
        if (!shouldHandOverToPage) {
            return;
        }
        // Wait for the sheet to finish closing, since navigating while it is still up gets dropped on iOS.
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                setIsVisible(false);
                landscapeStepRef.current = 'departing';
                onLandscapePress();
            },
        });
        return () => handle.cancel();
    }, [shouldHandOverToPage, onLandscapePress]);

    useEffect(() => {
        if (isFocused || landscapeStepRef.current !== 'departing') {
            return;
        }
        landscapeStepRef.current = 'away';
    }, [isFocused]);

    const openDropdown = () => {
        if (isInLandscapeMode) {
            openPageForLandscape();
            return;
        }

        if (isSmallScreenWidth) {
            setHasEverOpened(true);
            setIsVisible(true);
            return;
        }

        anchorRef.current?.measureInWindow((x, y, width, height) => {
            const spaceBelow = windowHeight - (y + height + CONTAINER_GAP);
            const spaceAbove = y - CONTAINER_GAP - (safeAreaTop + contentHeaderHeight);
            const shouldOpenAbove = spaceBelow < MAX_CONTAINER_HEIGHT && spaceAbove > spaceBelow;
            const availableHeight = (shouldOpenAbove ? spaceAbove : spaceBelow) - CONTAINER_BORDER;

            if (availableHeight < MIN_USABLE_HEIGHT) {
                onPress();
                return;
            }

            setLayout({
                horizontal: x,
                vertical: shouldOpenAbove ? y - CONTAINER_GAP : y + height + CONTAINER_GAP,
                width,
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
        if (isVisible) {
            closeDropdown();
            return;
        }
        openDropdown();
    };

    // Back on the form from the page opened for landscape. If the phone is in portrait again, that page closed itself, so
    // the list reopens once the page has finished closing. Still in landscape means the user picked or went back.
    useFocusEffect(() => {
        if (landscapeStepRef.current !== 'away') {
            return;
        }
        if (isInLandscapeMode || !shouldOpenInDropdown) {
            landscapeStepRef.current = 'idle';
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                landscapeStepRef.current = 'idle';
                openDropdown();
            },
            waitForUpcomingTransition: 'navigation',
        });
        return () => handle.cancel();
    });

    useImperativeHandle(ref, () => ({
        open: () => {
            if (!shouldOpenInDropdown) {
                onPress();
                return;
            }
            if (!isVisible) {
                openDropdown();
            }
        },
    }));

    return (
        <>
            <ExpenseFieldRow
                {...rowProps}
                anchorRef={shouldOpenInDropdown ? anchorRef : undefined}
                isExpanded={shouldOpenInDropdown ? isVisible && !shouldHandOverToPage : undefined}
                onPress={handlePress}
            />
            {hasEverOpened &&
                renderDropdown({
                    isVisible: isVisible && !shouldHandOverToPage,
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
export type {ExpenseFieldDropdownHandle, ExpenseFieldDropdownRenderProps};
