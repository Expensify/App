import type {ThemeStyles} from '@styles/index';
import type {StyleShorthands} from '@styles/utils/types';

import type {ViewStyle} from 'react-native';

type ContainerComposeStyles = (styles: ThemeStyles) => Array<ViewStyle & StyleShorthands>;

export default ContainerComposeStyles;
