import {ViewStyle} from 'react-native';
import {type ThemeStyles} from '@styles/styles';

type GetContextMenuItemStyle = (styles: ThemeStyles, windowWidth?: number) => ViewStyle[];

export default GetContextMenuItemStyle;
