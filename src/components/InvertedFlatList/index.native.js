import React, {forwardRef} from 'react';
import {View} from 'react-native';
import BaseInvertedFlatList from './BaseInvertedFlatList';

function CellRendererComponent(props) {
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[
                props.style,
                /**
                 * To achieve absolute positioning and handle overflows for list items,
                 * it is necessary to assign zIndex values. In the case of inverted lists,
                 * the lower list items will have higher zIndex values compared to the upper
                 * list items. Consequently, lower list items can overflow the upper list items.
                 * See: https://github.com/Expensify/App/issues/20451
                 */
                {zIndex: -props.index},
            ]}
        />
    );
}

export default forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        CellRendererComponent={CellRendererComponent}
        /**
         * To achieve absolute positioning and handle overflows for list items, the property must be disabled
         * for Android native builds.
         * Source: https://reactnative.dev/docs/0.71/optimizing-flatlist-configuration#removeclippedsubviews
         */
        removeClippedSubviews={false}
    />
));
