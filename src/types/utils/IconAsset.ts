import type {SvgProps} from 'react-native-svg/lib/typescript';

import type {SingleImageSource} from './ReactNativeCompat';

type IconAsset = React.FC<SvgProps> | SingleImageSource;

export default IconAsset;
