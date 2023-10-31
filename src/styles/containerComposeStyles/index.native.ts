import {ViewStyle} from 'react-native';
import {Styles} from '@styles/styles';
import ContainerComposeStyles from './types';

function getContainerComposeStyles(styles: Styles): ContainerComposeStyles {
    return [styles.textInputComposeSpacing as ViewStyle];
}

export default getContainerComposeStyles;
