import {ImageSourcePropType} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {AvatarSource} from '@libs/UserUtils';

type ImageOrSvgProps = ImageSourcePropType | React.FC<SvgProps>;

type IllustrationsType = {
    EmptyStateBackgroundImage: ImageOrSvgProps;
    ExampleCheckES: ImageOrSvgProps;
    ExampleCheckEN: ImageOrSvgProps;
    FallbackAvatar: AvatarSource;
    FallbackWorkspaceAvatar: AvatarSource;
};

// eslint-disable-next-line import/prefer-default-export
export {type IllustrationsType};
