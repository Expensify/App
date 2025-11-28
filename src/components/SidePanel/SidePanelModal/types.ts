import type {MutableRefObject, ReactNode} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

type SidePanelModalProps = {
    children: ReactNode;
    shouldHideSidePanel: boolean;
    sidePanelTranslateX: MutableRefObject<Animated.Value>;
    shouldHideSidePanelBackdrop: boolean;
    closeSidePanel: (shouldUpdateNarrow?: boolean) => void;
};

export default SidePanelModalProps;
