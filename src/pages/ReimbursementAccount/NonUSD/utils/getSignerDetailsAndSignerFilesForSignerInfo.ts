import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';

const {FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, ADDRESS, STREET, CITY, COUNTRY, STATE, ZIP_CODE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

const signerDetailsFields = [FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, STREET, CITY, STATE, ZIP_CODE, COUNTRY];

function getSignerDetailsAndSignerFilesForSignerInfo(signerKeys: string[], reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>) {
    const signerDetails: Record<string, string | FileObject[]> = {};
    // const signerFiles: Record<string, string | FileObject> = {};

    signerKeys.forEach((signerKey: string) => {
        signerDetailsFields.forEach((fieldName: string) => {
            if (!reimbursementAccountDraft?.[signerKey]) {
                return;
            }

            if (fieldName === STREET || fieldName === CITY || fieldName === STATE || fieldName === ZIP_CODE) {
                signerDetails[ADDRESS] = signerDetails[ADDRESS]
                    ? `${String(signerDetails[ADDRESS])}, ${String(reimbursementAccountDraft?.[signerKey])}`
                    : reimbursementAccountDraft?.[signerKey];
            }

            signerDetails[signerKey] = reimbursementAccountDraft?.[signerKey];
        });
    });

    return null;
}

export default getSignerDetailsAndSignerFilesForSignerInfo;
