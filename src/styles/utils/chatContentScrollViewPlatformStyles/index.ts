import {toViewStyle} from '@libs/WebOnlyStyleUtils';

import type ChatContentScrollViewPlatformStyles from './types';

const chatContentScrollViewPlatformStyles: ChatContentScrollViewPlatformStyles = toViewStyle({
    overflow: 'clip',
});

export default chatContentScrollViewPlatformStyles;
