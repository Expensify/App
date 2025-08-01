import {circularDeepEqual, deepEqual} from 'fast-equals';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import PopoverWithMeasuredContentUtils from '@libs/PopoverWithMeasuredContentUtils';
import CONST from '@src/CONST';
import type {AnchorDimensions, AnchorPosition} from '@src/styles';
import * as ActionSheetAwareScrollView from './ActionSheetAwareScrollView';
import type {PopoverAnchorPosition} from './Modal/types';
import Popover from './Popover';
import type PopoverProps from './Popover/types';

type PopoverWithMeasuredContentProps = Omit<PopoverProps, 'anchorPosition'> & {
    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: AnchorPosition;

    /** The dimension of anchor component */
    anchorDimensions?: AnchorDimensions;

    /** Whether we should change the vertical position if the popover's position is overflow */
    shouldSwitchPositionIfOverflow?: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;

    /** Whether we should should use top side for the anchor positioning */
    shouldMeasureAnchorPositionFromTop?: boolean;

    /** Whether to skip re-measurement when becoming visible (for components with static dimensions) */
    shouldSkipRemeasurement?: boolean;
};

/**
 * This is a convenient wrapper around the regular Popover component that allows us to use a more sophisticated
 * positioning schema responsively (without having to provide a static width and height for the popover content).
 * This way, we can shift the position of popover so that the content is anchored where we want it relative to the
 * anchor position.
 */

function PopoverWithMeasuredContent({
    popoverDimensions = {
        height: 0,
        width: 0,
    },
    anchorPosition,
    isVisible,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    children,
    withoutOverlay = false,
    fullscreen = true,
    shouldCloseOnOutsideClick = false,
    shouldSetModalVisibility = true,
    statusBarTranslucent = true,
    navigationBarTranslucent = true,
    avoidKeyboard = false,
    hideModalContentWhileAnimating = false,
    anchorDimensions = {
        height: 0,
        width: 0,
    },
    shouldSwitchPositionIfOverflow = false,
    shouldHandleNavigationBack = false,
    shouldEnableNewFocusManagement,
    shouldMeasureAnchorPositionFromTop = false,
    shouldSkipRemeasurement = false,
    ...props
}: PopoverWithMeasuredContentProps) {
    const actionSheetAwareScrollViewContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const [popoverWidth, setPopoverWidth] = useState(popoverDimensions.width);
    const [popoverHeight, setPopoverHeight] = useState(popoverDimensions.height);
    const [isContentMeasured, setIsContentMeasured] = useState(popoverWidth > 0 && popoverHeight > 0);
    const prevIsVisible = usePrevious(isVisible);
    const prevAnchorPosition = usePrevious(anchorPosition);
    const prevWindowDimensions = usePrevious({windowWidth, windowHeight});

    const modalId = useMemo(() => ComposerFocusManager.getId(), []);

    useEffect(() => {
        if (prevIsVisible || !isVisible || !shouldEnableNewFocusManagement) {
            return;
        }
        ComposerFocusManager.saveFocusState(modalId);
    }, [isVisible, shouldEnableNewFocusManagement, prevIsVisible, modalId]);

    if (!prevIsVisible && isVisible && isContentMeasured && !shouldSkipRemeasurement) {
        // Check if anything significant changed that would require re-measurement
        const hasAnchorPositionChanged = !deepEqual(prevAnchorPosition, anchorPosition);
        const hasWindowSizeChanged = !deepEqual(prevWindowDimensions, {windowWidth, windowHeight});
        const hasStaticDimensions = popoverDimensions.width > 0 && popoverDimensions.height > 0;

        // Only reset if:
        // 1. We don't have static dimensions, OR
        // 2. The anchor position changed significantly, OR
        // 3. The window size changed significantly
        if (!hasStaticDimensions || hasAnchorPositionChanged || hasWindowSizeChanged) {
            setIsContentMeasured(false);
        }
    }

    /**
     * Measure the size of the popover's content.
     */
    const measurePopover = ({nativeEvent}: LayoutChangeEvent) => {
        const {width, height} = nativeEvent.layout;
        setPopoverWidth(width);
        setPopoverHeight(height);
        setIsContentMeasured(true);

        // it handles the case when `measurePopover` is called with values like: 192, 192.00003051757812, 192
        // if we update it, then animation in `ActionSheetAwareScrollView` may be re-running
        // and we'll see out-of-sync and junky animation
        if (actionSheetAwareScrollViewContext.currentActionSheetState.get().current.payload?.popoverHeight !== Math.floor(height) && height !== 0) {
            actionSheetAwareScrollViewContext.transitionActionSheetState({
                type: ActionSheetAwareScrollView.Actions.MEASURE_POPOVER,
                payload: {
                    popoverHeight: Math.floor(height),
                },
            });
        }
    };

    const adjustedAnchorPosition = useMemo(() => {
        let horizontalConstraint;
        switch (anchorAlignment.horizontal) {
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                horizontalConstraint = {left: anchorPosition.horizontal - popoverWidth};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                horizontalConstraint = {
                    left: Math.floor(anchorPosition.horizontal - popoverWidth / 2),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
            default:
                horizontalConstraint = {left: anchorPosition.horizontal};
        }

        let verticalConstraint;
        switch (anchorAlignment.vertical) {
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM:
                verticalConstraint = {top: anchorPosition.vertical - popoverHeight};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.CENTER:
                verticalConstraint = {
                    top: Math.floor(anchorPosition.vertical - popoverHeight / 2),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP:
            default:
                verticalConstraint = {top: anchorPosition.vertical};
        }
        return {
            ...horizontalConstraint,
            ...verticalConstraint,
        };
    }, [anchorPosition, anchorAlignment, popoverWidth, popoverHeight]);

    const positionCalculations = useMemo(() => {
        const horizontalShift = PopoverWithMeasuredContentUtils.computeHorizontalShift(adjustedAnchorPosition.left, popoverWidth, windowWidth);
        const verticalShift = PopoverWithMeasuredContentUtils.computeVerticalShift(
            adjustedAnchorPosition.top,
            popoverHeight,
            windowHeight,
            anchorDimensions.height,
            shouldSwitchPositionIfOverflow,
        );
        return {horizontalShift, verticalShift};
    }, [adjustedAnchorPosition.left, adjustedAnchorPosition.top, popoverWidth, popoverHeight, windowWidth, windowHeight, anchorDimensions.height, shouldSwitchPositionIfOverflow]);

    const shiftedAnchorPosition: PopoverAnchorPosition = useMemo(() => {
        const result: PopoverAnchorPosition = {
            left: adjustedAnchorPosition.left + positionCalculations.horizontalShift,
        };

        if (shouldMeasureAnchorPositionFromTop) {
            result.top = adjustedAnchorPosition.top + positionCalculations.verticalShift;
        }

        if (anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP) {
            const top = adjustedAnchorPosition.top + positionCalculations.verticalShift;
            const maxTop = windowHeight - popoverHeight - positionCalculations.verticalShift;
            result.top = Math.min(Math.max(positionCalculations.verticalShift, top), maxTop);
        }

        if (anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM) {
            result.bottom = windowHeight - (adjustedAnchorPosition.top + popoverHeight) - positionCalculations.verticalShift;
        }

        return result;
    }, [adjustedAnchorPosition, positionCalculations, anchorAlignment.vertical, windowHeight, popoverHeight, shouldMeasureAnchorPositionFromTop]);

    return isContentMeasured ? (
        <Popover
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            popoverDimensions={{height: popoverHeight, width: popoverWidth}}
            anchorAlignment={anchorAlignment}
            isVisible={isVisible}
            withoutOverlay={withoutOverlay}
            fullscreen={fullscreen}
            shouldCloseOnOutsideClick={shouldCloseOnOutsideClick}
            shouldSetModalVisibility={shouldSetModalVisibility}
            statusBarTranslucent={statusBarTranslucent}
            navigationBarTranslucent={navigationBarTranslucent}
            avoidKeyboard={avoidKeyboard}
            hideModalContentWhileAnimating={hideModalContentWhileAnimating}
            modalId={modalId}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            anchorPosition={shiftedAnchorPosition}
        >
            <View onLayout={measurePopover}>{children}</View>
        </Popover>
    ) : (
        /*
      This is an invisible view used to measure the size of the popover,
      before it ever needs to be displayed.
      We do this because we need to know its dimensions in order to correctly animate the popover,
      but we can't measure its dimensions without first rendering it.
  */
        <View
            style={styles.invisiblePopover}
            onLayout={measurePopover}
        >
            {children}
        </View>
    );
}
PopoverWithMeasuredContent.displayName = 'PopoverWithMeasuredContent';

export default React.memo(PopoverWithMeasuredContent, (prevProps, nextProps) => {
    if (prevProps.isVisible === nextProps.isVisible && nextProps.isVisible === false) {
        return true;
    }
    return circularDeepEqual(prevProps, nextProps);
});

export type {PopoverWithMeasuredContentProps};
