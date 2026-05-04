import type {OnyxEntry} from 'react-native-onyx';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type Policy from '@src/types/onyx/Policy';
import type ReimbursementAccount from '@src/types/onyx/ReimbursementAccount';

function getCurrencyForNonUSDBankAccount(
    policy: OnyxEntry<Policy>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
): {country: Country | ''; currency: string} {
    const country = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? CONST.BBA_COUNTRY_CURRENCY_MAP[country] ?? '';
    return {country, currency};
}

export default getCurrencyForNonUSDBankAccount;
