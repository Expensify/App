import type {StackScreenProps} from '@react-navigation/stack';
import type {OnyxEntry} from 'react-native-onyx';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import type {Account, Credentials, Session} from '@src/types/onyx';

type ValidateLoginPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The credentials of the person logging in */
    credentials: OnyxEntry<Credentials>;

    /** Session of currently logged in user */
    session: OnyxEntry<Session>;
};

type ValidateLoginPageProps = ValidateLoginPageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

export type {ValidateLoginPageOnyxProps, ValidateLoginPageProps};
