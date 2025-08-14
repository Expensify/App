import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const attachmentModalScreenOptions: PlatformStackNavigationOptions = {
    headerShown: false,
    presentation: Presentation.TRANSPARENT_MODAL,
};

export default attachmentModalScreenOptions;
