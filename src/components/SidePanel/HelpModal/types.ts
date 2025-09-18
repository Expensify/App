import type {MutableRefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

type HelpProps = {
    shouldHideSidePanel: boolean;
    sidePanelTranslateX: MutableRefObject<Animated.Value>;
    shouldHideSidePanelBackdrop: boolean;
    closeSidePanel: (shouldUpdateNarrow?: boolean) => void;
};

export default HelpProps;
