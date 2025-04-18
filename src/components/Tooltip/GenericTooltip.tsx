import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {View as RNView} from 'react-native';
import {cancelAnimation, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import StringUtils from '@libs/StringUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import callOrReturn from '@src/types/utils/callOrReturn';
import BaseGenericTooltip from './BaseGenericTooltip';
import TooltipSense from './TooltipSense';
import type {GenericTooltipProps} from './types';

/**
 * The generic tooltip implementation, exposing the tooltip's state
 * while leaving the tooltip's target bounds computation to its parent.
 */
function GenericTooltip({
    children,
    numberOfLines = CONST.TOOLTIP_MAX_LINES,
    maxWidth = variables.sideBarWidth,
    text = '',
    renderTooltipContent,
    renderTooltipContentKey = [],
    shiftHorizontal = 0,
    shiftVertical = 0,
    shouldForceRenderingBelow = false,
    wrapperStyle = {},
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    shouldForceAnimate = false,
    shouldUseOverlay: shouldUseOverlayProp = false,
    shouldTeleportPortalToModalLayer,
    shouldRender = true,
    isEducationTooltip = false,
    onTooltipPress = () => {},
}: GenericTooltipProps) {
    const {preferredLocale} = useLocalize();
    const {windowWidth} = useWindowDimensions();

    const wrapperRef = useRef<RNView>(null);

    const [isRendered, setIsRendered] = useState(false);

    // Is the tooltip currently visible?
    const [isVisible, setIsVisible] = useState(false);

    // The distance between the left side of the wrapper view and the left side of the window
    const [xOffset, setXOffset] = useState(0);

    // The distance between the top of the wrapper view and the top of the window
    const [yOffset, setYOffset] = useState(0);

    // The width and height of the wrapper view
    const [wrapperWidth, setWrapperWidth] = useState(0);
    const [wrapperHeight, setWrapperHeight] = useState(0);
    // Transparent overlay should disappear once user taps it
    const [shouldUseOverlay, setShouldUseOverlay] = useState(shouldUseOverlayProp);

    // Whether the tooltip is first tooltip to activate the TooltipSense
    const animation = useSharedValue<number>(0);
    const isTooltipSenseInitiator = useSharedValue<boolean>(true);
    const isAnimationCanceled = useSharedValue<boolean>(false);
    const prevText = usePrevious(text);

    useEffect(() => {
        if (!renderTooltipContent || !text) {
            return;
        }
        Log.warn('Developer error: Cannot use both text and renderTooltipContent props at the same time in <TooltipRenderedOnPageBody />!');
    }, [text, renderTooltipContent]);
     /**
     * Display the tooltip in an animation.
     */
    const showTooltip = useCallback(() => {
        setIsRendered(true);
        setIsVisible(true);
        cancelAnimation(animation);
        // When TooltipSense is active, immediately show the tooltip
        if (TooltipSense.isActive() && !shouldForceAnimate) {
            animation.set(1);
        } else {
            isTooltipSenseInitiator.set(true);
            animation.set(
                withDelay(
                    500,
                    withTiming(1, {duration: 140}, (finished) => {
                        isAnimationCanceled.set(!finished);
                    }),
                ),
            );
        }

        TooltipSense.activate();
    }, [animation, isAnimationCanceled, isTooltipSenseInitiator, shouldForceAnimate]);

    useEffect(() => {
        if (isVisible && isAnimationCanceled.get() && text && prevText !== text) {
            isAnimationCanceled.set(false);
            showTooltip();
        }
    }, [isVisible, text, prevText, showTooltip, isAnimationCanceled]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // if the tooltip text changed before the initial animation was finished, then the tooltip won't be shown
        // we need to show the tooltip again
        if (isRendered && wrapperRef.current) {
            wrapperRef.current.measureInWindow((x, y, width, height) => {
                setXOffset(x);
                setYOffset(y);
                setWrapperWidth(width);
                setWrapperHeight(height);
            });
        }
    }, [isRendered]);

    const hideTooltip = useCallback(() => {
        cancelAnimation(animation);
        if (TooltipSense.isActive() && !isTooltipSenseInitiator.get()) {
            animation.set(0);
        } else {
            isTooltipSenseInitiator.set(false);
            animation.set(0);
        }
        TooltipSense.deactivate();
        setIsVisible(false);
    }, [animation, isTooltipSenseInitiator]);

    const onPressOverlay = useCallback(() => {
        if (!shouldUseOverlay) {
            return;
        }
        setShouldUseOverlay(false);
        hideTooltip();
    }, [shouldUseOverlay, hideTooltip]);

    if (StringUtils.isEmptyString(text) && renderTooltipContent == null) {
        return children({isVisible, showTooltip, hideTooltip, updateTargetBounds: () => {}});
    }

    return (
        <>
            {shouldRender && isRendered && (
                <BaseGenericTooltip
                    isEducationTooltip={isEducationTooltip}
                    animation={animation}
                    windowWidth={windowWidth}
                    xOffset={xOffset}
                    yOffset={yOffset}
                    targetWidth={wrapperWidth}
                    targetHeight={wrapperHeight}
                    shiftHorizontal={callOrReturn(shiftHorizontal)}
                    shiftVertical={callOrReturn(shiftVertical)}
                    text={text}
                    maxWidth={maxWidth}
                    numberOfLines={numberOfLines}
                    renderTooltipContent={renderTooltipContent}
                    key={[text, ...renderTooltipContentKey, preferredLocale].join('-')}
                    shouldForceRenderingBelow={shouldForceRenderingBelow}
                    wrapperStyle={wrapperStyle}
                    anchorAlignment={anchorAlignment}
                    shouldUseOverlay={shouldUseOverlay}
                    shouldTeleportPortalToModalLayer={shouldTeleportPortalToModalLayer}
                    onHideTooltip={onPressOverlay}
                    onTooltipPress={onTooltipPress}
                />
            )}

            <View ref={wrapperRef}>
                {children({
                    isVisible,
                    showTooltip,
                    hideTooltip,
                    updateTargetBounds: () => {},
                })}
            </View>
        </>
    );
}

GenericTooltip.displayName = 'GenericTooltip';

export default memo(GenericTooltip);
