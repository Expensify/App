import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';

type SignerInfoAddressValues = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
};

const {STREET, CITY, STATE, ZIP_CODE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

function getAddressValuesForSignerInfo(prefix: string, reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>): SignerInfoAddressValues {
    if (!reimbursementAccountDraft) {
        return {
            street: '',
            city: '',
            state: '',
            zipCode: '',
        };
    }

    return {
        street: reimbursementAccountDraft[STREET],
        city: reimbursementAccountDraft[CITY],
        state: reimbursementAccountDraft[STATE],
        zipCode: reimbursementAccountDraft[ZIP_CODE],
    };
}

export default getAddressValuesForSignerInfo;
