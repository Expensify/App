import type {RefObject} from 'react';
import type {View} from 'react-native';

type UseDialogContainerFocus = (ref: RefObject<View | null>, isReady: boolean, claimInitialFocus?: () => boolean) => void;

export default UseDialogContainerFocus;
