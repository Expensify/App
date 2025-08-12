import type {ForwardedRef} from 'react';
import {forwardRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';

function OptionRowRendererComponent(
    {
        index,
        onLayout,
        style,
        children,
    }: {
        index: number;
        onLayout?: () => void;
        style?: StyleProp<ViewStyle>;
        children?: React.ReactNode;
    },
    ref: ForwardedRef<View>,
) {
    return (
        <View
            ref={ref}
            onLayout={onLayout}
            style={[style, {zIndex: -index}]}
        >
            {children}
        </View>
    );
}

OptionRowRendererComponent.displayName = 'OptionRowRendererComponent';

export default forwardRef(OptionRowRendererComponent);
