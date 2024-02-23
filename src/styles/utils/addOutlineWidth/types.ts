import type {TextStyle, ViewStyle} from 'react-native';
import type {ThemeColors} from '@styles/theme/types';

type AddOutlineWidth = <TStyle extends TextStyle | ViewStyle>(theme: ThemeColors, obj: TStyle, val?: number, hasError?: boolean) => TStyle;

export default AddOutlineWidth;
