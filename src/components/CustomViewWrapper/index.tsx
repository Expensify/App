import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import {View} from 'react-native';

type CustomViewWrapperProps = PropsWithChildren<{
    style?: ViewStyle;
}>;

function CustomViewWrapper({children, style}: CustomViewWrapperProps) {
    return <View style={style}>{children}</View>;
}

export default CustomViewWrapper;
