import BaseInvertedFlatList from './BaseInvertedFlatList';
import React, {forwardRef} from 'react';

const InvertedFlatList = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseInvertedFlatList
        {...props}
        ref={ref}

        // Setting removeClippedSubviews will break text selection on Android
        removeClippedSubviews={false}
        onEndReached={() => {
            props.onScrollToTop();
        }}
    />
));

InvertedFlatList.displayName = 'InvertedFlatList';
export default InvertedFlatList;
