import type {RefObject} from 'react';

type UseDialogContainerFocus = (ref: RefObject<{focus: () => void} | null>, isReady: boolean, claimInitialFocus?: () => boolean) => void;

export default UseDialogContainerFocus;
