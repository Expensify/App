import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import {View} from 'react-native';

type DisplayContentsViewProps = PropsWithChildren<{
    style?: ViewStyle;
}>;

function DisplayContentsView({children, style}: DisplayContentsViewProps) {
    return <View style={style}>{children}</View>;
}

export default DisplayContentsView;
