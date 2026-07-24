import type {FocusTrapProps} from 'focus-trap-react';
import type {RefObject} from 'react';
import type {View} from 'react-native';

type FocusTrapOptions = Exclude<FocusTrapProps['focusTrapOptions'], undefined>;

type FocusTrapForModalProps = {
    children: React.ReactNode;
    active: boolean;
    initialFocus?: FocusTrapOptions['initialFocus'];
    shouldPreventScroll?: boolean;
    shouldReturnFocus?: boolean;
    /** Popover anchor ref; used as the launcher when document.activeElement is unavailable (e.g. pre-blurred trigger). */
    launcherRef?: RefObject<View | HTMLDivElement | HTMLElement | null>;
};

export default FocusTrapForModalProps;
