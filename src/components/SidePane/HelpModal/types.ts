import type {MutableRefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

type HelpProps = {
    shouldHideSidePane: boolean;
    sidePaneTranslateX: MutableRefObject<Animated.Value>;
    shouldHideSidePaneBackdrop: boolean;
    closeSidePane: (shouldUpdateNarrow?: boolean) => void;
};

export default HelpProps;
