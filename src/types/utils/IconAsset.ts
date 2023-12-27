import {ImageSourcePropType} from 'react-native';
import {SvgProps} from 'react-native-svg/lib/typescript';

type IconAsset = React.FC<SvgProps> | ImageSourcePropType;

export default IconAsset;
