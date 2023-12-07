import {TextStyle} from 'react-native';
import {type ThemeColors} from '@styles/theme/types';

type AddOutlineWidth = (theme: ThemeColors, obj: TextStyle, val?: number, hasError?: boolean) => TextStyle;

export default AddOutlineWidth;
