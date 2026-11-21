/**
 * Split state and actions contexts connecting InteractiveTooltip.Root, Trigger, Content, and consumer triggers/links.
 */
import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';

import type {ComponentRef} from 'react';
import type {LayoutRectangle, View} from 'react-native';

import {createContext, useContext} from 'react';

type InteractiveTooltipStateContextValue = {
    isVisible: boolean;
    isPinned: boolean;
    anchorBounds: LayoutRectangle;
    anchorAlignment?: TooltipAnchorAlignment;
    maxWidth?: number;
    shiftHorizontal?: number | (() => number);
    shiftVertical?: number | (() => number);
    shouldForceRenderingBelow?: boolean;
    shouldTeleportPortalToModalLayer?: boolean;
};

type InteractiveTooltipActionsContextValue = {
    onTooltipElementChange?: (element: HTMLElement | null) => void;
    registerTrigger: (element: ComponentRef<typeof View> | null) => void;
    openTooltip: () => void;
    closeTooltip: () => void;
    enterTriggerHover: () => void;
    leaveTriggerHover: () => void;
    enterTooltipHover: () => void;
    leaveTooltipHover: () => void;
    enterTriggerFocus: () => void;
    leaveTriggerFocus: () => void;
    enterTooltipFocus: () => void;
    leaveTooltipFocus: () => void;
};

const InteractiveTooltipStateContext = createContext<InteractiveTooltipStateContextValue | null>(null);
const InteractiveTooltipActionsContext = createContext<InteractiveTooltipActionsContextValue | null>(null);

function useInteractiveTooltipState(): InteractiveTooltipStateContextValue {
    const context = useContext(InteractiveTooltipStateContext);
    if (!context) {
        throw new Error('useInteractiveTooltipState must be used inside InteractiveTooltip.Root');
    }
    return context;
}

function useInteractiveTooltipActions(): InteractiveTooltipActionsContextValue {
    const context = useContext(InteractiveTooltipActionsContext);
    if (!context) {
        throw new Error('useInteractiveTooltipActions must be used inside InteractiveTooltip.Root');
    }
    return context;
}

export {InteractiveTooltipStateContext, InteractiveTooltipActionsContext, useInteractiveTooltipState, useInteractiveTooltipActions};
export type {InteractiveTooltipStateContextValue, InteractiveTooltipActionsContextValue};
