import type {StackScreenProps} from '@react-navigation/stack';
import type {OnyxEntry} from 'react-native-onyx';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type {Account, Credentials, Session} from '@src/types/onyx';

type ValidateLoginPageOnyxNativeProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<Session>;
};

type ValidateLoginPageOnyxProps = ValidateLoginPageOnyxNativeProps & {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The credentials of the person logging in */
    credentials: OnyxEntry<Credentials>;
};

type ValidateLoginPageProps<OnyxProps> = OnyxProps & StackScreenProps<PublicScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

export type {ValidateLoginPageOnyxNativeProps, ValidateLoginPageOnyxProps, ValidateLoginPageProps};
