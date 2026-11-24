import type {RenderActionSheetAwareScrollViewComponent} from '@components/ActionSheetAwareScrollView/types';

import type * as OnyxTypes from '@src/types/onyx';

import type {LegendListRef} from '@legendapp/list/react-native';
import type {RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

type UseViewportBottomAnchorParams = {
    legendListRef: RefObject<LegendListRef | null>;

    /** The rows LegendList renders. */
    listData: OnyxTypes.ReportAction[];

    /** Changes when LegendList remounts, which starts over without an anchor. */
    listID: string;

    /** Whether the rows start at the top edge of the list instead of ending at its bottom edge. */
    shouldBeAlignedToTop: boolean;
};

type ViewportBottomAnchor = {
    /** Starts keeping the bottom edge in place once LegendList has positioned the list. */
    startViewportAnchor: () => void;

    /** Returns true when a scroll event must not be processed yet, because it can predate a pending correction. */
    deferScrollUntilViewportCorrected: (event: ScrollEvent) => boolean;

    /** Stops waiting for a pending correction, for example because the reader starts dragging. */
    finishViewportCorrection: () => void;

    /**
     * Keeps the anchored content at the bottom edge of a viewport that changed height. Returns the new distance from
     * the end of the list, or undefined when nothing changed.
     */
    preserveViewportBottom: (height: number, replayScrollEvent: (event: ScrollEvent) => void) => number | undefined;

    /** The scroll component the list renders with, on platforms that anchor the viewport in the scroll component. */
    renderScrollComponent: RenderActionSheetAwareScrollViewComponent | undefined;
};

export type {ScrollEvent, UseViewportBottomAnchorParams, ViewportBottomAnchor};
