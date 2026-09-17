import type {ThemeColors} from '@styles/theme/types';

import type {TextStyle, ViewStyle} from 'react-native';

type AddOutlineWidth = <TStyle extends TextStyle | ViewStyle>(theme: ThemeColors, obj: TStyle, val?: number, hasError?: boolean) => TStyle;

export default AddOutlineWidth;
