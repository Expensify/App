import type {FC} from 'react';
import type {ImageSourcePropType} from 'react-native';
import type {SvgProps} from 'react-native-svg';

type IllustrationsType = {
    EmptyStateBackgroundImage: ImageSourcePropType;
    ExampleCheckES: ImageSourcePropType;
    ExampleCheckEN: ImageSourcePropType;
    WorkspaceProfile: ImageSourcePropType;
    ExpensifyApprovedLogo: FC<SvgProps>;
};

export default IllustrationsType;
