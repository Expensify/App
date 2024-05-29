import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '@libs/Navigation/types';

// This field in linkingConfig is supported on native only.
const subscribe: LinkingOptions<RootStackParamList>['subscribe'] = undefined;

export default subscribe;
