import {ViewStyle} from 'react-native';
import styles from '@styles/styles';

type ContainerComposeStyles = (stylesObject: typeof styles) => ViewStyle[];

export default ContainerComposeStyles;
