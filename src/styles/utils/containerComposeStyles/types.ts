import type {ViewStyle} from 'react-native';
import type {ThemeStyles} from '@styles/index';

type ContainerComposeStyles = (styles: ThemeStyles) => ViewStyle[];

export default ContainerComposeStyles;
