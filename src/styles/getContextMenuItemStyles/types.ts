import {ViewStyle} from 'react-native';
import styles from '@styles/styles';

type GetContextMenuItemStyle = (themeStyles: typeof styles, windowWidth?: number) => ViewStyle[];

export default GetContextMenuItemStyle;
