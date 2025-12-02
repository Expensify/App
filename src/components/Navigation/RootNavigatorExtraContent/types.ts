import type {ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

type RootNavigatorExtraContentProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

export default RootNavigatorExtraContentProps;
