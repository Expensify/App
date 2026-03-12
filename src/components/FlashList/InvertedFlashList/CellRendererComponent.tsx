import React from 'react';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';

type CellRendererComponentProps = ViewProps & {
    index: number;
    style?: StyleProp<ViewStyle>;
};

function CellRendererComponent(props: CellRendererComponentProps) {
    const flattenedStyle = StyleSheet.flatten(props.style);
    // FlashList sets `top` for positioning of cells. We omit it here
    // because FlashList manages cell positioning internally and the `top` value
    // conflicts with the inverted zIndex stacking we apply below.
    const {top, ...styleWithoutTop} = flattenedStyle ?? {};

    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[
                styleWithoutTop,
                /**
                 * To achieve absolute positioning and handle overflows for list items,
                 * it is necessary to assign zIndex values. In the case of inverted lists,
                 * the lower list items will have higher zIndex values compared to the upper
                 * list items. Consequently, lower list items can overflow the upper list items.
                 * See: https://github.com/Expensify/App/issues/20451
                 */
                {zIndex: -props.index, position: 'relative'},
            ]}
        />
    );
}

export default CellRendererComponent;
