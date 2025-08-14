import {forwardRef} from 'react';
import type {ForwardedRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';

type OptionRowRendererComponentProps = {
    index: number;
    onLayout?: () => void;
    style?: StyleProp<ViewStyle>;
};

function OptionRowRendererComponent(props: OptionRowRendererComponentProps, ref: ForwardedRef<View>) {
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            style={[props.style, {zIndex: -props.index}]}
        />
    );
}

OptionRowRendererComponent.displayName = 'OptionRowRendererComponent';

export default forwardRef(OptionRowRendererComponent);
