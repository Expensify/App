import type {ImageSourcePropType} from 'react-native';
import type {SvgProps} from 'react-native-svg/lib/typescript';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type IconAsset = React.FC<SvgProps> | ImageSourcePropType | Icon[];

export default IconAsset;
