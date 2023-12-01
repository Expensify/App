import {ViewStyle} from 'react-native';
import themeStyles from '@styles/styles';

type ContainerComposeStyles = (styles: typeof themeStyles) => ViewStyle[];

export default ContainerComposeStyles;
