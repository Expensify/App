import type {ReactNode, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

type SidePanelModalProps = {
    children: ReactNode;
    shouldHideSidePanel: boolean;
    sidePanelTranslateX: RefObject<Animated.Value>;
    shouldHideSidePanelBackdrop: boolean;
    closeSidePanel: (shouldUpdateNarrow?: boolean) => void;
};

export default SidePanelModalProps;
