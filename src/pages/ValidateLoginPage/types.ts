import type {StackScreenProps} from '@react-navigation/stack';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type ValidateLoginPageProps = StackScreenProps<PublicScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

export type {ValidateLoginPageProps};
