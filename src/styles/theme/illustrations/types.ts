import type {FC} from 'react';
import type {ImageSourcePropType} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import type IconAsset from '@src/types/utils/IconAsset';

type IllustrationsType = {
    EmptyStateBackgroundImage: ImageSourcePropType;
    ExampleCheckES: ImageSourcePropType;
    ExampleCheckEN: ImageSourcePropType;
    WorkspaceProfile: ImageSourcePropType;
    ExpensifyApprovedLogo: FC<SvgProps>;
    GenericCompanyCard: IconAsset;
    GenericCompanyCardLarge: IconAsset;
    GenericCSVCompanyCardLarge: IconAsset;
};

export default IllustrationsType;
