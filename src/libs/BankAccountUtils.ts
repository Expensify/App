// import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDefaultCompanyWebsite(session: OnyxEntry<OnyxTypes.Session>, user: OnyxEntry<OnyxTypes.User>): string {
    // return user?.isFromPublicDomain ? 'https://' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
    // temporarily always returns https:// to fix https://github.com/Expensify/App/issues/47227 until https://github.com/Expensify/App/issues/45278 is resolved.
    return 'https://';
}

function getLastFourDigits(bankAccountNumber: string): string {
    return bankAccountNumber ? bankAccountNumber.slice(-4) : '';
}

export {getDefaultCompanyWebsite, getLastFourDigits};
