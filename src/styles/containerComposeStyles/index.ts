import {ViewStyle} from 'react-native';
import {Styles} from '@styles/styles';
import ContainerComposeStyles from './types';

// We need to set paddingVertical = 0 on web to avoid displaying a normal pointer on some parts of compose box when not in focus
function getContainerComposeStyles(styles: Styles): ContainerComposeStyles {
    return [styles.textInputComposeSpacing as ViewStyle, {paddingVertical: 0}];
}

export default getContainerComposeStyles;
