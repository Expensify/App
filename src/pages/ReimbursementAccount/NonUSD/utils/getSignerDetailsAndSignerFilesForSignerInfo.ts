import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';

const {PREFIX, FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, ADDRESS, STREET, CITY, STATE, ZIP_CODE, DIRECTOR_OCCUPATION, DIRECTOR_FULL_NAME, DIRECTOR_JOB_TITLE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

const signerDetailsFields = [FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, STREET, CITY, STATE, ZIP_CODE, DIRECTOR_OCCUPATION, DIRECTOR_FULL_NAME, DIRECTOR_JOB_TITLE];

function getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>, signerEmail: string, directorID: string) {
    const signerDetails: Record<string, string | FileObject[]> = {};

    signerDetailsFields.forEach((fieldName: string) => {
        if (fieldName === EMAIL) {
            signerDetails[fieldName] = signerEmail;
            return;
        }

        if (directorID === 'currentUser') {
            const fieldKey = `${PREFIX}_${directorID}_${fieldName}`;

            if (fieldName === DIRECTOR_FULL_NAME) {
                signerDetails[fieldKey] = String(reimbursementAccountDraft?.[FULL_NAME]);
                return;
            }

            if (fieldName === DIRECTOR_JOB_TITLE) {
                signerDetails[fieldKey] = String(reimbursementAccountDraft?.[JOB_TITLE]);
                return;
            }

            if (fieldName === DIRECTOR_OCCUPATION) {
                signerDetails[fieldKey] = String(reimbursementAccountDraft?.[fieldKey]);
                return;
            }
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
