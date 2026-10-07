import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

type UseDialogContainerFocus = (ref: RefObject<ComponentRef<typeof View> | null>, isReady: boolean, claimInitialFocus?: () => boolean, skipDialogContainerFocus?: boolean) => void;

export default UseDialogContainerFocus;
