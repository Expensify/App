/**
 * Web portal for InteractiveTooltip, handling measurement, focus-trap registration, hover persistence, and outside-click dismissal.
 */
import TransparentOverlay from '@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay';
import Hoverable from '@components/Hoverable';
import {usePopoverActions} from '@components/PopoverProvider';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';
import viewRef from '@src/types/utils/viewRef';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';

import type InteractiveTooltipPortalProps from './types';

function stopEventPropagation(event: {stopPropagation: () => void}) {
    event.stopPropagation();
}

function InteractiveTooltipPortal({
    children,
    anchorBounds,
    isPinned,
    actionsValue,
    anchorAlignment,
    maxWidth,
    shiftHorizontal = 0,
    shiftVertical = 0,
    shouldForceRenderingBelow = false,
}: InteractiveTooltipPortalProps) {
    const {windowWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {setActivePopoverExtraAnchorRef} = usePopoverActions();
    const {closeTooltip, onTooltipElementChange, enterTooltipHover, leaveTooltipHover, enterTooltipFocus, leaveTooltipFocus} = actionsValue;

    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();
    const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const rootWrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setActivePopoverExtraAnchorRef(rootWrapper);
    }, [setActivePopoverExtraAnchorRef]);

    useEffect(() => {
        if (!onTooltipElementChange) {
            return;
        }
        onTooltipElementChange(rootWrapper.current);
        return () => {
            onTooltipElementChange(null);
        };
    }, [onTooltipElementChange]);

    useLayoutEffect(() => {
        setRootElement(rootWrapper.current);
        setContentMeasuredWidth(contentRef.current?.getBoundingClientRect().width);
        setWrapperMeasuredHeight(rootWrapper.current?.getBoundingClientRect().height);
    }, []);

    const body = document.querySelector('body');
    if (!body) {
        return null;
    }

    const {rootWrapperStyle, pointerWrapperStyle, pointerStyle, overlayStyle} = StyleUtils.getTooltipStyles({
        tooltip: rootElement,
        windowWidth,
        xOffset: anchorBounds.x,
        yOffset: anchorBounds.y,
        tooltipTargetWidth: anchorBounds.width,
        tooltipTargetHeight: anchorBounds.height,
        maxWidth: maxWidth ?? 0,
        tooltipContentWidth: contentMeasuredWidth,
        tooltipWrapperHeight: wrapperMeasuredHeight,
        manualShiftHorizontal: shiftHorizontal,
        manualShiftVertical: shiftVertical,
        shouldForceRenderingBelow,
        anchorAlignment,
        wrapperStyle: {},
        isInteractive: true,
    });

    return ReactDOM.createPortal(
        // React portals bubble synthetic events through the component tree, so stop them here before they reach a pressable ancestor such as a table row.
        <View
            onClick={stopEventPropagation}
            onMouseDown={stopEventPropagation}
            onPointerDown={stopEventPropagation}
            onPointerUp={stopEventPropagation}
            onTouchStart={stopEventPropagation}
        >
            {isPinned && (
                <TransparentOverlay
                    onPress={closeTooltip}
                    sentryLabel={CONST.SENTRY_LABEL.TOOLTIP.OVERLAY}
                    style={overlayStyle}
                />
            )}
            <Hoverable
                shouldUseNativeHoverEvents
                onHoverIn={enterTooltipHover}
                onHoverOut={leaveTooltipHover}
            >
                <View
                    ref={viewRef(rootWrapper)}
                    style={rootWrapperStyle}
                    role={CONST.ROLE.TOOLTIP}
                >
                    <View
                        ref={viewRef(contentRef)}
                        fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                        onFocus={enterTooltipFocus}
                        onBlur={leaveTooltipFocus}
                    >
                        {children}
                    </View>
                    {/* pointerWrapperStyle uses fixed positioning on web, so override it to absolute to anchor the pointer to this non-transformed wrapper. */}
                    <View style={[pointerWrapperStyle, styles.pAbsolute]}>
                        <View style={pointerStyle} />
                    </View>
                </View>
            </Hoverable>
        </View>,
        body,
    );
}

export default InteractiveTooltipPortal;
