import React, {useCallback, useState} from 'react';
import {FlatList} from 'react-native';
import KeyboardDismissibleFlatList from '@components/KeyboardDismissibleFlatList';
import type {CustomFlatListProps} from './types';

// On iOS, we have to unset maintainVisibleContentPosition while the user is scrolling to prevent jumping to the beginning issue
function CustomFlatList<T>({ref, maintainVisibleContentPosition: originalMaintainVisibleContentPosition, shouldUseAnimatedKeyboardHandler, ...rest}: CustomFlatListProps<T>) {
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const handleScrollEnd = useCallback(() => {
        setIsScrolling(false);
    }, []);

    const maintainVisibleContentPosition = isScrolling ? undefined : originalMaintainVisibleContentPosition;

    if (shouldUseAnimatedKeyboardHandler) {
        return (
            <KeyboardDismissibleFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={ref}
                maintainVisibleContentPosition={maintainVisibleContentPosition}
                onMomentumScrollBegin={handleScrollBegin}
                onMomentumScrollEnd={handleScrollEnd}
            />
        );
    }

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
