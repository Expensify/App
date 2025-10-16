import React, {useCallback, useState} from 'react';
import {FlatList} from 'react-native';
import type {CustomFlatListProps} from './index';

// On iOS, we have to unset maintainVisibleContentPosition while the user is scrolling to prevent jumping to the beginning issue
function CustomFlatList<T>({ref, ...props}: CustomFlatListProps<T>) {
    const {maintainVisibleContentPosition: originalMaintainVisibleContentPosition, shouldDisableVisibleContentPosition, ...rest} = props;
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const handleScrollEnd = useCallback(() => {
        setIsScrolling(false);
    }, []);

    const maintainVisibleContentPosition = isScrolling || shouldDisableVisibleContentPosition ? undefined : originalMaintainVisibleContentPosition;

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
export default CustomFlatList;
