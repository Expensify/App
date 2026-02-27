import type {RefObject} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';

type UseFocusAfterNav = (ref: RefObject<AnimatedTextInputRef | null>, shouldDelayFocus: boolean) => boolean;

export default UseFocusAfterNav;
