import {ViewStyle} from 'react-native';
import {type ThemeStyles} from '@styles/styles';

type ContainerComposeStyles = (styles: ThemeStyles) => ViewStyle[];

export default ContainerComposeStyles;
