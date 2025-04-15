import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {BeneficialOwnerDataKey, SignerInfoStepProps} from '@src/types/form/ReimbursementAccountForm';

const {FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, ADDRESS, STREET, CITY, STATE, ZIP_CODE, PROOF_OF_DIRECTORS, ADDRESS_PROOF, COPY_OF_ID, CODICE_FISCALE, DOWNLOADED_PDS_AND_FSG} =
    CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
const {
    PREFIX: BENEFICIAL_PREFIX,
    FIRST_NAME,
    LAST_NAME,
    DOB,
    STREET: BENEFICIAL_STREET,
    CITY: BENEFICIAL_CITY,
    STATE: BENEFICIAL_STATE,
    ZIP_CODE: BENEFICIAL_ZIP_CODE,
} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

const signerDetailsFields = [FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, STREET, CITY, STATE, ZIP_CODE, DOWNLOADED_PDS_AND_FSG];
const signerFilesFields = [PROOF_OF_DIRECTORS, ADDRESS_PROOF, COPY_OF_ID, CODICE_FISCALE];
const beneficialOwnerFields = [FIRST_NAME, LAST_NAME, DOB, BENEFICIAL_STREET, BENEFICIAL_CITY, BENEFICIAL_STATE, BENEFICIAL_ZIP_CODE];

function getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>, signerEmail: string, isUserBeneficialOwner: boolean) {
    const signerDetails: Record<string, string | boolean | FileObject[]> = {};
    const signerFiles: Record<string, string | FileObject | boolean> = {};

    signerDetailsFields.forEach((fieldName: keyof SignerInfoStepProps) => {
        if (fieldName === EMAIL) {
            signerDetails[fieldName] = signerEmail;
            return;
        }

        if (fieldName === DOWNLOADED_PDS_AND_FSG) {
            // hardcoded "true" temporarily - it will be handled properly in separate PR
            signerDetails[fieldName] = true;
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

    if (isUserBeneficialOwner) {
        signerDetails[FULL_NAME] = '';
        signerDetails[DATE_OF_BIRTH] = '';
        signerDetails[ADDRESS] = '';

        beneficialOwnerFields.forEach((fieldName) => {
            const beneficialFieldKey: BeneficialOwnerDataKey = `${BENEFICIAL_PREFIX}_${CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY}_${fieldName}`;

            if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                signerDetails[FULL_NAME] = signerDetails[FULL_NAME]
                    ? `${String(signerDetails[FULL_NAME])} ${String(reimbursementAccountDraft?.[beneficialFieldKey])}`
                    : String(reimbursementAccountDraft?.[beneficialFieldKey]);
                return;
            }

            if (fieldName === DOB) {
                signerDetails[DATE_OF_BIRTH] = String(reimbursementAccountDraft?.[beneficialFieldKey]);
                return;
            }

            if (fieldName === BENEFICIAL_STREET || fieldName === BENEFICIAL_CITY || fieldName === BENEFICIAL_STATE || fieldName === BENEFICIAL_ZIP_CODE) {
                signerDetails[ADDRESS] = signerDetails[ADDRESS]
                    ? `${String(signerDetails[ADDRESS])}, ${String(reimbursementAccountDraft?.[beneficialFieldKey])}`
                    : String(reimbursementAccountDraft?.[beneficialFieldKey]);
            }
        });
    }

    signerFilesFields.forEach((fieldName) => {
        if (!reimbursementAccountDraft?.[fieldName]) {
            return;
        }

        // eslint-disable-next-line rulesdir/prefer-at
        signerFiles[fieldName] = reimbursementAccountDraft?.[fieldName][0];
    });

    return {signerDetails, signerFiles};
}

export default getSignerDetailsAndSignerFilesForSignerInfo;
