import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

function getDefaultCompanyWebsite(session: OnyxEntry<OnyxTypes.Session>, user: OnyxEntry<OnyxTypes.User>): string {
    return user?.isFromPublicDomain ? 'https://' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
}
// eslint-disable-next-line import/prefer-default-export
export {getDefaultCompanyWebsite};
