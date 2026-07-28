import type {ThemeStyles} from '@styles/index';

import type {ViewStyle} from 'react-native';

type ContainerComposeStyles = (styles: ThemeStyles) => ViewStyle[];

export default ContainerComposeStyles;
