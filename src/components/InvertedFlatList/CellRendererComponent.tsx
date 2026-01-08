import React from 'react';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import {View} from 'react-native';

type CellRendererComponentProps = ViewProps & {
    index: number;
    style?: StyleProp<ViewStyle>;
};

function CellRendererComponent(props: CellRendererComponentProps) {
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
                {zIndex: -props.index, position: 'relative'},
            ]}
        />
    );
}

export default CellRendererComponent;
