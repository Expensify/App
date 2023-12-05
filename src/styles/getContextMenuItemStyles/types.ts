import {ViewStyle} from 'react-native';
import {type ThemeStyles} from '@styles/styles';

type GetContextMenuItemStyle = (themeStyles: ThemeStyles, windowWidth?: number) => ViewStyle[];

export default GetContextMenuItemStyle;
