import {useId} from 'react';
import type {LayoutChangeEvent, ViewStyle} from 'react-native';
import useAnchoredPosition from '@components/Overlay/hooks/useAnchoredPosition';
import type {AnchorRect} from '@components/Overlay/libs/measureAnchor';
import type {PopoverContentRole} from '@components/Popover/v2/root/state';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import {DEFAULT_OFFSET_PX, DEFAULT_PLACEMENT, placementToAlignment} from './placement';
import type {PopoverPlacement} from './placement';

type UsePopoverContentInput = {
    anchorRect: AnchorRect | null;
    alignment?: AnchorAlignment;
    placement?: PopoverPlacement;
    offsetPx?: number;
    role?: PopoverContentRole;
    contentID?: string;
    triggerID?: string;
    titleID?: string;
    descriptionID?: string;
    accessibilityLabel?: string;
};

type UsePopoverContentResult = {
    contentProps: {
        role: PopoverContentRole;
        nativeID: string;
        accessibilityLabel?: string;
        accessibilityLabelledBy?: string;
        accessibilityDescribedBy?: string;
    };
    positionProps: {
        style: ViewStyle;
        onLayout: (event: LayoutChangeEvent) => void;
    };
    isPositioned: boolean;
    available: {height: number; width: number};
};

function usePopoverContent({
    anchorRect,
    alignment: alignmentProp,
    placement = DEFAULT_PLACEMENT,
    offsetPx = DEFAULT_OFFSET_PX,
    role = 'region',
    contentID: contentIDProp,
    triggerID,
    titleID,
    descriptionID,
    accessibilityLabel,
}: UsePopoverContentInput): UsePopoverContentResult {
    const generatedContentID = useId();
    const contentID = contentIDProp ?? generatedContentID;
    const alignment = alignmentProp ?? placementToAlignment(placement);
    const {style, isPositioned, available, onContentLayout} = useAnchoredPosition({anchorRect, alignment, offsetPx});

    return {
        contentProps: {
            role,
            nativeID: contentID,
            accessibilityLabel,
            accessibilityLabelledBy: titleID ?? triggerID,
            accessibilityDescribedBy: descriptionID,
        },
        positionProps: {
            style: {...style, maxHeight: available.height, opacity: isPositioned ? 1 : 0},
            onLayout: onContentLayout,
        },
        isPositioned,
        available,
    };
}

export default usePopoverContent;
export type {UsePopoverContentInput, UsePopoverContentResult};
