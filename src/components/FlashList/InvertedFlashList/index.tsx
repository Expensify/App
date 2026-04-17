import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import React, {useRef} from 'react';
import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';
import useInvertedWheelHandler from './useInvertedWheelHandler';

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

function InvertedFlashList<T>({ref, data, keyExtractor, initialScrollKey, onStartReached: onStartReachedProp, ...restProps}: InvertedFlashListProps<T>) {
    const {displayedData, onStartReached} = useFlashListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        onStartReached: onStartReachedProp,
    });

    const innerRef = useRef<FlashListRef<T> | null>(null);
    useInvertedWheelHandler(innerRef);

    const composedRef = (node: FlashListRef<T> | null) => {
        innerRef.current = node;
        if (ref) {
            const userRef = ref as unknown as React.MutableRefObject<FlashListRef<T> | null>;
            userRef.current = node;
        }
    };

    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted
            ref={composedRef}
            onStartReached={onStartReached}
            data={displayedData}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
