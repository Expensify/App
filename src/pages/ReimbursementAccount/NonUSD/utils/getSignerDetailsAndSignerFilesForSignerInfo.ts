import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';

const {FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, ADDRESS, STREET, CITY, STATE, ZIP_CODE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

const signerDetailsFields = [FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, STREET, CITY, STATE, ZIP_CODE];

function getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>, signerEmail: string) {
    const signerDetails: Record<string, string | FileObject[]> = {};

    signerDetailsFields.forEach((fieldName: string) => {
        if (fieldName === EMAIL) {
            signerDetails[fieldName] = signerEmail;
            return;
        }

        if (!reimbursementAccountDraft?.[fieldName]) {
            return;
        }

        if (fieldName === STREET || fieldName === CITY || fieldName === STATE || fieldName === ZIP_CODE) {
            signerDetails[ADDRESS] = signerDetails[ADDRESS] ? `${String(signerDetails[ADDRESS])}, ${String(reimbursementAccountDraft?.[fieldName])}` : reimbursementAccountDraft?.[fieldName];
            return;
        }

        signerDetails[fieldName] = reimbursementAccountDraft?.[fieldName];
    });

    return {signerDetails};
}

export default getSignerDetailsAndSignerFilesForSignerInfo;
