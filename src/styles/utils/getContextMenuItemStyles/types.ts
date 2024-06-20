import type {ViewStyle} from 'react-native';
import type {ThemeStyles} from '@styles/index';

type GetContextMenuItemStyle = (styles: ThemeStyles, windowWidth?: number) => ViewStyle[];

export default GetContextMenuItemStyle;
