import type {OnyxEntry} from 'react-native-onyx';
import type {Account, Credentials} from '@src/types/onyx';

type SAMLSignInPageOnyxProps = {
    /** The credentials of the logged in person */
    credentials: OnyxEntry<Credentials>;

    /** State of the logging in user's account */
    account: OnyxEntry<Account>;
};

type SAMLSignInPageProps = SAMLSignInPageOnyxProps;

export type {SAMLSignInPageProps, SAMLSignInPageOnyxProps};
