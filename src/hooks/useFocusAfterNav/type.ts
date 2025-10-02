import type {RefObject} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';

type UseFocusAfterNav = (ref: RefObject<AnimatedTextInputRef | null>) => boolean;

export default UseFocusAfterNav;
