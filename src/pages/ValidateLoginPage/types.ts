import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type ValidateLoginPageProps = PlatformStackScreenProps<PublicScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

export default ValidateLoginPageProps;
