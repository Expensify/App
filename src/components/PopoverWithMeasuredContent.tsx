import isEqual from 'lodash/isEqual';
import React, {useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import PopoverWithMeasuredContentUtils from '@libs/PopoverWithMeasuredContentUtils';
import CONST from '@src/CONST';
import type {AnchorDimensions, AnchorPosition} from '@src/styles';
import Popover from './Popover';
import type PopoverProps from './Popover/types';

type PopoverWithMeasuredContentProps = Omit<PopoverProps, 'anchorPosition'> & {
    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: AnchorPosition;

    /** The dimension of anchor component */
    anchorDimensions?: AnchorDimensions;

    /** Whether we should change the vertical position if the popover's position is overflow */
    shoudSwitchPositionIfOverflow?: boolean;

    /** Whether handle navigation back when modal show. */
    shouldHandleNavigationBack?: boolean;
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
    avoidKeyboard = false,
    hideModalContentWhileAnimating = false,
    anchorDimensions = {
        height: 0,
        width: 0,
    },
    shoudSwitchPositionIfOverflow = false,
    shouldHandleNavigationBack = false,
    shouldEnableNewFocusManagement,
    ...props
}: PopoverWithMeasuredContentProps) {
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const [popoverWidth, setPopoverWidth] = useState(popoverDimensions.width);
    const [popoverHeight, setPopoverHeight] = useState(popoverDimensions.height);
    const [isContentMeasured, setIsContentMeasured] = useState(popoverWidth > 0 && popoverHeight > 0);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);

    const modalId = useMemo(() => ComposerFocusManager.getId(), []);

    /**
     * When Popover becomes visible, we need to recalculate the Dimensions.
     * Skip render on Popover until recalculations are done by setting isContentMeasured to false as early as possible.
     */
    if (!isPopoverVisible && isVisible) {
        if (shouldEnableNewFocusManagement) {
            ComposerFocusManager.saveFocusState(modalId);
        }
        // When Popover is shown recalculate
        setIsContentMeasured(popoverDimensions.width > 0 && popoverDimensions.height > 0);
        setIsPopoverVisible(true);
    } else if (isPopoverVisible && !isVisible) {
        setIsPopoverVisible(false);
    }

    /**
     * Measure the size of the popover's content.
     */
    const measurePopover = ({nativeEvent}: LayoutChangeEvent) => {
        setPopoverWidth(nativeEvent.layout.width);
        setPopoverHeight(nativeEvent.layout.height);
        setIsContentMeasured(true);
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

    const horizontalShift = PopoverWithMeasuredContentUtils.computeHorizontalShift(adjustedAnchorPosition.left, popoverWidth, windowWidth);
    const verticalShift = PopoverWithMeasuredContentUtils.computeVerticalShift(
        adjustedAnchorPosition.top,
        popoverHeight,
        windowHeight,
        anchorDimensions.height,
        shoudSwitchPositionIfOverflow,
    );
    const shiftedAnchorPosition = {
        left: adjustedAnchorPosition.left + horizontalShift,
        bottom: windowHeight - (adjustedAnchorPosition.top + popoverHeight) - verticalShift,
    };

    return isContentMeasured ? (
        <Popover
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            popoverDimensions={popoverDimensions}
            anchorAlignment={anchorAlignment}
            isVisible={isVisible}
            withoutOverlay={withoutOverlay}
            fullscreen={fullscreen}
            shouldCloseOnOutsideClick={shouldCloseOnOutsideClick}
            shouldSetModalVisibility={shouldSetModalVisibility}
            statusBarTranslucent={statusBarTranslucent}
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
    return isEqual(prevProps, nextProps);
});
