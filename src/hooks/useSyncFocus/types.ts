import type {RefObject} from 'react';
import type {View} from 'react-native';

type UseSyncFocus = (ref: RefObject<View | HTMLElement | null>, isFocused: boolean, shouldSyncFocus?: boolean) => void;

export default UseSyncFocus;
