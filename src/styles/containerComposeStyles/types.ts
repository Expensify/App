import {ViewStyle} from 'react-native';
import styles from '../styles';

type ContainerComposeStyles = Array<Pick<typeof styles, 'textInputComposeSpacing'> | Pick<ViewStyle, 'paddingVertical'>>;

export default ContainerComposeStyles;
