import {ImageSourcePropType} from 'react-native';
import {AvatarSource} from '@libs/UserUtils';

type IllustrationsType = {
    EmptyStateBackgroundImage: ImageSourcePropType;
    ExampleCheckES: ImageSourcePropType;
    ExampleCheckEN: ImageSourcePropType;
    FallbackAvatar: AvatarSource;
    FallbackWorkspaceAvatar: AvatarSource;
};

// eslint-disable-next-line import/prefer-default-export
export {type IllustrationsType};
