import type {AnimatedTextInputRef} from '@components/RNTextInput';

import type {RefObject} from 'react';

type UseFocusAfterNav = (ref: RefObject<AnimatedTextInputRef | null>, shouldDelayFocus: boolean) => boolean;

export default UseFocusAfterNav;
