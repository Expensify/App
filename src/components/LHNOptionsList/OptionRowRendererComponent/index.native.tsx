import type {ForwardedRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';

type OptionRowRendererComponentProps = {
    /** The index position of this option row in the list */
    index: number;

    /** Callback function called when the component layout changes */
    onLayout?: () => void;

    /** Style prop for customizing the option row */
    style?: StyleProp<ViewStyle>;

    /** Reference to outer element */
    ref?: ForwardedRef<View>;
};

function OptionRowRendererComponent({ref, ...props}: OptionRowRendererComponentProps) {
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

export default OptionRowRendererComponent;
