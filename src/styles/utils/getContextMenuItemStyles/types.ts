import type {ThemeStyles} from '@styles/index';

import type {ViewStyle} from 'react-native';

type GetContextMenuItemStyle = (styles: ThemeStyles, windowWidth?: number) => ViewStyle[];

export default GetContextMenuItemStyle;
