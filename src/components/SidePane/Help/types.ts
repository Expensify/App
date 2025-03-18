import type {MutableRefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

type HelpProps = {
    sidePaneTranslateX: MutableRefObject<Animated.Value>;
    closeSidePane: (shouldUpdateNarrow?: boolean) => void;
};

export default HelpProps;
