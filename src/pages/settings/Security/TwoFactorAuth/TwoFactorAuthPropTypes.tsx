import type {OnyxEntry} from 'react-native-onyx';
import type {Account, Session} from '@src/types/onyx';

type TwoFactorAuthOnyxProps = {

    account: OnyxEntry<Account>;
    session: OnyxEntry<Session>;

}

export default TwoFactorAuthOnyxProps