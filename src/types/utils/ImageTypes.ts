import type {ImageSourcePropType} from 'react-native';
import type {SvgProps} from 'react-native-svg/lib/typescript';

type SvgIconComponent = React.FC<SvgProps>;
type IconAsset = React.FC<SvgProps> | ImageSourcePropType;

export type {SvgIconComponent, IconAsset};
