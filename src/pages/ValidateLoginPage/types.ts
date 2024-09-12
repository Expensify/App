import type {StackScreenProps} from '@react-navigation/stack';
import type {OnyxEntry} from 'react-native-onyx';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type {Account, Credentials, Session} from '@src/types/onyx';
import type {AutoAuthState} from '@src/types/onyx/Session';

type ValidateLoginPageOnyxNativeProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<Session>;
};

type ValidateLoginPageOnyxProps = ValidateLoginPageOnyxNativeProps & {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The credentials of the person logging in */
    credentials: OnyxEntry<Credentials>;

    autoAuthState: OnyxEntry<AutoAuthState>;
};

type ValidateLoginPageProps<OnyxProps> = OnyxProps & StackScreenProps<PublicScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

export type {ValidateLoginPageOnyxNativeProps, ValidateLoginPageOnyxProps, ValidateLoginPageProps};
