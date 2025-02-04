import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';

type SignerInfoAddressValues = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
};

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
        street: reimbursementAccountDraft[`${prefix}_street`],
        city: reimbursementAccountDraft[`${prefix}_city`],
        state: reimbursementAccountDraft[`${prefix}_state`],
        zipCode: reimbursementAccountDraft[`${prefix}_zipCode`],
    };
}

export default getAddressValuesForSignerInfo;
