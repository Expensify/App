import BaseInvertedFlatList from './BaseInvertedFlatList';
import React, {forwardRef} from 'react';

const InvertedFlatList = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseInvertedFlatList
        {...props}
        ref={ref}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
        onEndReached={() => {
            console.log('end reached');
            // props.onScrollToTop();
        }}
        // onScroll={({nativeEvent}) => {
        //     const scrollTop = (nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height);
        //     if (scrollTop === nativeEvent.contentSize.height) {
        //         console.log('top reached')
        //         props.onScrollToTop();
        //     }
        // }}
    />
));

InvertedFlatList.displayName = 'InvertedFlatList';
export default InvertedFlatList;
