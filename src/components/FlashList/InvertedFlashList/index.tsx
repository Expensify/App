import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

/** Approximate row height for `initialScrollIndexParams.viewOffset` (FlashList uses `layout.y + viewOffset`). */
const ESTIMATED_ITEM_HEIGHT_PX = 50;
const LINK_BOTTOM_OFFSET_RATIO = 0.4;
/** `LINK_BOTTOM_OFFSET_RATIO` is applied in full at this height; shorter windows use a lower effective ratio. */
const WINDOW_HEIGHT_AT_FULL_LINK_OFFSET = 900;
const MIN_LINK_OFFSET_RATIO_SCALE = 0.35;

type InvertedFlashListProps<T> = FlashListProps<T> & {
    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey?: string | null;

    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Ref to the underlying list instance. */
    ref: FlatListRefType;
};

function InvertedFlashList<T>({data, keyExtractor, initialScrollKey, onStartReached: onStartReachedProp, ...restProps}: InvertedFlashListProps<T>) {
    const {onStartReached, maintainVisibleContentPosition} = useFlashListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        onStartReached: onStartReachedProp,
    });

    const {windowHeight} = useWindowDimensions();
    const targetIndex = initialScrollKey == null ? -1 : data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);
    const initialScrollIndex = targetIndex < 0 ? undefined : targetIndex;

    // Smaller viewports get a lower effective ratio so the link offset doesn’t over-nudge (e.g. on phones in landscape).
    const linkOffsetRatioScale = Math.max(MIN_LINK_OFFSET_RATIO_SCALE, Math.min(1, windowHeight / WINDOW_HEIGHT_AT_FULL_LINK_OFFSET));
    const effectiveLinkBottomOffsetRatio = LINK_BOTTOM_OFFSET_RATIO * linkOffsetRatioScale;
    const viewOffset = initialScrollIndex === undefined ? undefined : (ESTIMATED_ITEM_HEIGHT_PX - windowHeight) * effectiveLinkBottomOffsetRatio;
    const initialScrollIndexParams: FlashListProps<T>['initialScrollIndexParams'] = viewOffset === undefined ? undefined : {viewOffset};

    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            inverted
            onStartReached={onStartReached}
            data={data}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
            initialScrollIndex={initialScrollIndex}
            initialScrollIndexParams={initialScrollIndexParams}
        />
    );
}

export default InvertedFlashList;
