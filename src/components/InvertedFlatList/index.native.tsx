import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import type {BaseInvertedFlatListProps} from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';

function BaseInvertedFlatListWithRef<T>({ref, shouldHideContent = false, ...props}: BaseInvertedFlatListProps<T>) {
    const styles = useThemeStyles();
    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            CellRendererComponent={CellRendererComponent}
            contentContainerStyle={[props.contentContainerStyle, shouldHideContent ? styles.opacity0 : styles.opacity1]}
            /**
             * To achieve absolute positioning and handle overflows for list items, the property must be disabled
             * for Android native builds.
             * Source: https://reactnative.dev/docs/0.71/optimizing-flatlist-configuration#removeclippedsubviews
             */
            removeClippedSubviews={false}
        />
    );
}

BaseInvertedFlatListWithRef.displayName = 'BaseInvertedFlatListWithRef';

export default BaseInvertedFlatListWithRef;
