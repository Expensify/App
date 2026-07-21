/**
 * Web uses a plain View. Native needs display: 'contents' (see index.native.tsx) so wrapper nodes
 * don't hide the navigation underlay during swipe-back or Activity visibility toggles — that issue
 * does not apply on web, and the native implementation relies on internal React Native APIs.
 */
import {View} from 'react-native';

import type DisplayContentsViewProps from './types';

function DisplayContentsView({children, style}: DisplayContentsViewProps) {
    return <View style={style}>{children}</View>;
}

export default DisplayContentsView;
