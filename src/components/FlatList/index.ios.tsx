import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useState} from 'react';
import type {FlatListProps} from 'react-native';
import {FlatList} from 'react-native';

// On iOS, we have to unset maintainVisibleContentPosition while the user is scrolling to prevent jumping to the beginning issue
function CustomFlatList<T>(props: FlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {maintainVisibleContentPosition: originalMaintainVisibleContentPosition, ...rest} = props;
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const handleScrollEnd = useCallback(() => {
        setIsScrolling(false);
    }, []);

    const maintainVisibleContentPosition = isScrolling ? undefined : originalMaintainVisibleContentPosition;

    return (
        <FlatList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            onMomentumScrollBegin={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
        />
    );
}

CustomFlatList.displayName = 'CustomFlatListWithRef';
export default forwardRef(CustomFlatList);
