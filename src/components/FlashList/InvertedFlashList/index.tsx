import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
// Experiment: `initialScrollIndex` + full `data` instead of `@components/FlashList/useFlashListScrollKey`
// (slice + MVCP). That hook is unused while this is enabled — see useFlashListScrollKey.ts to restore.
// import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

/** Where the top of the linked item should sit in the list viewport, as a fraction of visible height (from the top). */
const INITIAL_LINK_TOP_OFFSET_RATIO = 0.33;

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
    // const {displayedData, onStartReached, maintainVisibleContentPosition} = useFlashListScrollKey<T>({
    //     data,
    //     keyExtractor,
    //     initialScrollKey,
    //     onStartReached: onStartReachedProp,
    // });

    const {windowHeight} = useWindowDimensions();
    const targetIndex = initialScrollKey == null ? -1 : data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);
    const initialScrollIndex = targetIndex > 0 ? targetIndex : undefined;
    // FlashList applies `layout.y + viewOffset` for the initial jump. Nudge so the item's top is ~33% from the top of the list.
    const initialScrollIndexParams: FlashListProps<T>['initialScrollIndexParams'] =
        initialScrollIndex === undefined ? undefined : {viewOffset: -windowHeight * INITIAL_LINK_TOP_OFFSET_RATIO};

    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted
            onStartReached={onStartReachedProp}
            data={data}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
            initialScrollIndex={initialScrollIndex}
            initialScrollIndexParams={initialScrollIndexParams}
        />
    );
}

export default InvertedFlashList;
