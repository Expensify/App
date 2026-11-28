/**
 * Compound tooltip for interactive content such as links.
 * Opens on hover (desktop), keyboard focus, or explicit trigger activation (click/tap), stays open while the pointer or focus moves into the tooltip, and dismisses on outside press or Escape.
 */
import Hoverable from '@components/Hoverable';
import {getTooltipCoordinates} from '@components/Tooltip/EducationalTooltip/measureTooltipCoordinate';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';
import callOrReturn from '@src/types/utils/callOrReturn';

import type {ComponentRef, ReactNode} from 'react';
import type {LayoutRectangle, View as RNView} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import {InteractiveTooltipActionsContext, InteractiveTooltipStateContext, useInteractiveTooltipActions, useInteractiveTooltipState} from './InteractiveTooltipContext';
import InteractiveTooltipPortal from './InteractiveTooltipPortal';

// Bridges the pointer or focus gap when moving between the trigger and the tooltip body.
const TOOLTIP_INTERACTION_CLOSE_DELAY_MS = 150;
const DEFAULT_TOOLTIP_MAX_WIDTH = variables.sideBarWidth - 2 * variables.uploadViewMargin;
const INITIAL_BOUNDS: LayoutRectangle = {x: 0, y: 0, width: 0, height: 0};

type InteractiveTooltipRootProps = {
    children: ReactNode;
    anchorAlignment?: TooltipAnchorAlignment;

    /** Maximum tooltip width in px, defaults to `DEFAULT_TOOLTIP_MAX_WIDTH`. */
    maxWidth?: number;

    /** Horizontal offset in px (positive shifts right, negative shifts left). Function form evaluates when shown. */
    shiftHorizontal?: number | (() => number);

    /** Vertical offset in px (positive shifts down, negative shifts up). Function form evaluates when shown. */
    shiftVertical?: number | (() => number);

    shouldForceRenderingBelow?: boolean;

    /** Native only: mounts the portal into the `'modal'` PortalHost instead of the root host. */
    shouldTeleportPortalToModalLayer?: boolean;

    /** Reports the rendered tooltip root element on web so callers can register it with a focus trap. */
    onTooltipElementChange?: (element: HTMLElement | null) => void;
};

type InteractiveTooltipTriggerProps = {
    children: ReactNode;
};

type InteractiveTooltipContentProps = {
    children: ReactNode;
};

function InteractiveTooltipRoot({
    children,
    anchorAlignment,
    maxWidth = DEFAULT_TOOLTIP_MAX_WIDTH,
    shiftHorizontal,
    shiftVertical,
    shouldForceRenderingBelow,
    shouldTeleportPortalToModalLayer,
    onTooltipElementChange,
}: InteractiveTooltipRootProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [anchorBounds, setAnchorBounds] = useState<LayoutRectangle>(INITIAL_BOUNDS);
    const triggerElementRef = useRef<ComponentRef<typeof RNView> | null>(null);
    const isPinnedRef = useRef(false);
    const isHoveringTriggerRef = useRef(false);
    const isHoveringTooltipRef = useRef(false);
    const isFocusWithinTriggerRef = useRef(false);
    const isFocusWithinTooltipRef = useRef(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const clearCloseTimer = () => {
        if (!closeTimerRef.current) {
            return;
        }
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = undefined;
    };

    useEffect(() => clearCloseTimer, []);

    const closeTooltip = () => {
        clearCloseTimer();
        isPinnedRef.current = false;
        isHoveringTriggerRef.current = false;
        isHoveringTooltipRef.current = false;
        isFocusWithinTriggerRef.current = false;
        isFocusWithinTooltipRef.current = false;
        setIsPinned(false);
        setIsVisible(false);
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, closeTooltip, {
        isActive: isVisible,
        shouldBubble: false,
    });

    const measureAndShow = () => {
        const triggerElement = triggerElementRef.current;
        if (!triggerElement) {
            return;
        }
        getTooltipCoordinates(triggerElement, (bounds) => {
            setAnchorBounds(bounds);
            setIsVisible(true);
        });
    };

    const scheduleCloseIfInactive = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            closeTimerRef.current = undefined;
            if (isHoveringTriggerRef.current || isHoveringTooltipRef.current || isFocusWithinTriggerRef.current || isFocusWithinTooltipRef.current || isPinnedRef.current) {
                return;
            }
            setIsVisible(false);
        }, TOOLTIP_INTERACTION_CLOSE_DELAY_MS);
    };

    const registerTrigger = (element: ComponentRef<typeof RNView> | null) => {
        triggerElementRef.current = element;
    };

    const openTooltip = () => {
        clearCloseTimer();
        isPinnedRef.current = true;
        setIsPinned(true);
        measureAndShow();
    };

    const enterTriggerHover = () => {
        isHoveringTriggerRef.current = true;
        clearCloseTimer();
        measureAndShow();
    };

    const leaveTriggerHover = () => {
        isHoveringTriggerRef.current = false;
        scheduleCloseIfInactive();
    };

    const enterTooltipHover = () => {
        isHoveringTooltipRef.current = true;
        clearCloseTimer();
    };

    const leaveTooltipHover = () => {
        isHoveringTooltipRef.current = false;
        scheduleCloseIfInactive();
    };

    const enterTriggerFocus = () => {
        isFocusWithinTriggerRef.current = true;
        clearCloseTimer();
        measureAndShow();
    };

    const leaveTriggerFocus = () => {
        isFocusWithinTriggerRef.current = false;
        scheduleCloseIfInactive();
    };

    const enterTooltipFocus = () => {
        isFocusWithinTooltipRef.current = true;
        clearCloseTimer();
    };

    const leaveTooltipFocus = () => {
        isFocusWithinTooltipRef.current = false;
        scheduleCloseIfInactive();
    };

    const stateValue = {
        isVisible,
        isPinned,
        anchorBounds,
        anchorAlignment,
        maxWidth,
        shiftHorizontal,
        shiftVertical,
        shouldForceRenderingBelow,
        shouldTeleportPortalToModalLayer,
    };

    const actionsValue = {
        onTooltipElementChange,
        registerTrigger,
        openTooltip,
        closeTooltip,
        enterTriggerHover,
        leaveTriggerHover,
        enterTooltipHover,
        leaveTooltipHover,
        enterTriggerFocus,
        leaveTriggerFocus,
        enterTooltipFocus,
        leaveTooltipFocus,
    };

    return (
        <InteractiveTooltipStateContext.Provider value={stateValue}>
            <InteractiveTooltipActionsContext.Provider value={actionsValue}>{children}</InteractiveTooltipActionsContext.Provider>
        </InteractiveTooltipStateContext.Provider>
    );
}

function InteractiveTooltipTrigger({children}: InteractiveTooltipTriggerProps) {
    const {registerTrigger, enterTriggerHover, leaveTriggerHover, enterTriggerFocus, leaveTriggerFocus} = useInteractiveTooltipActions();

    return (
        <Hoverable
            shouldUseNativeHoverEvents
            onHoverIn={enterTriggerHover}
            onHoverOut={leaveTriggerHover}
        >
            <View
                ref={registerTrigger}
                collapsable={false}
                onFocus={enterTriggerFocus}
                onBlur={leaveTriggerFocus}
            >
                {children}
            </View>
        </Hoverable>
    );
}

function InteractiveTooltipContent({children}: InteractiveTooltipContentProps) {
    const {isVisible, isPinned, anchorBounds, anchorAlignment, maxWidth, shiftHorizontal, shiftVertical, shouldForceRenderingBelow, shouldTeleportPortalToModalLayer} =
        useInteractiveTooltipState();
    const actionsValue = useInteractiveTooltipActions();

    if (!isVisible) {
        return null;
    }

    return (
        <InteractiveTooltipPortal
            anchorBounds={anchorBounds}
            isPinned={isPinned}
            actionsValue={actionsValue}
            anchorAlignment={anchorAlignment}
            maxWidth={maxWidth}
            shiftHorizontal={callOrReturn(shiftHorizontal)}
            shiftVertical={callOrReturn(shiftVertical)}
            shouldForceRenderingBelow={shouldForceRenderingBelow}
            shouldTeleportPortalToModalLayer={shouldTeleportPortalToModalLayer}
        >
            {children}
        </InteractiveTooltipPortal>
    );
}

const InteractiveTooltip = {
    Root: InteractiveTooltipRoot,
    Trigger: InteractiveTooltipTrigger,
    Content: InteractiveTooltipContent,
};

export default InteractiveTooltip;
