import {View} from 'react-native';

import type DisplayContentsViewProps from './types';

function DisplayContentsView({children, style}: DisplayContentsViewProps) {
    return <View style={style}>{children}</View>;
}

export default DisplayContentsView;
