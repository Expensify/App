import {TextStyle} from 'react-native';
import {ThemeColors} from '@styles/themes/types';

type AddOutlineWidth = (obj: TextStyle, theme?: ThemeColors, val?: number, hasError?: boolean) => TextStyle;

export default AddOutlineWidth;
