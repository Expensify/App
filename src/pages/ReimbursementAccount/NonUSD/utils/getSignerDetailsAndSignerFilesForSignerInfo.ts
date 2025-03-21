import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {BeneficialOwnerDataKey, SignerInfoDirectorDataKey, SignerInfoStepProps} from '@src/types/form/ReimbursementAccountForm';

const {
    DIRECTOR_PREFIX,
    FULL_NAME,
    EMAIL,
    JOB_TITLE,
    DATE_OF_BIRTH,
    ADDRESS,
    STREET,
    CITY,
    STATE,
    ZIP_CODE,
    DIRECTOR_OCCUPATION,
    DIRECTOR_FULL_NAME,
    DIRECTOR_JOB_TITLE,
    PROOF_OF_DIRECTORS,
    ADDRESS_PROOF,
    COPY_OF_ID,
    CODICE_FISCALE,
    PRD_AND_SFG,
} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
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

const signerDetailsFields = [FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, STREET, CITY, STATE, ZIP_CODE, DIRECTOR_OCCUPATION, DIRECTOR_FULL_NAME, DIRECTOR_JOB_TITLE];
const signerFilesFields = [PROOF_OF_DIRECTORS, ADDRESS_PROOF, COPY_OF_ID, CODICE_FISCALE, PRD_AND_SFG];
const beneficialOwnerFields = [FIRST_NAME, LAST_NAME, DOB, BENEFICIAL_STREET, BENEFICIAL_CITY, BENEFICIAL_STATE, BENEFICIAL_ZIP_CODE];

function getSignerDetailsAndSignerFilesForSignerInfo(
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    signerEmail: string,
    directorIDs: string[],
    isUserBeneficialOwner: boolean,
) {
    const signerDetails: Record<string, string | FileObject[]> = {};
    const signerFiles: Record<string, string | FileObject> = {};

    signerDetailsFields.forEach((fieldName: keyof SignerInfoStepProps) => {
        if (fieldName === EMAIL) {
            signerDetails[fieldName] = signerEmail;
            return;
        }

        directorIDs.forEach((directorID: string) => {
            const fieldKey: SignerInfoDirectorDataKey = `${DIRECTOR_PREFIX}_${directorID}_${fieldName}`;
            if (directorID === CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY) {
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
                }
            } else if (reimbursementAccountDraft?.[fieldKey]) {
                signerDetails[fieldKey] = String(reimbursementAccountDraft?.[fieldKey]);
            }
        });

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
        signerDetails[`${DIRECTOR_PREFIX}_${CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY}_${DIRECTOR_FULL_NAME}`] = '';

        beneficialOwnerFields.forEach((fieldName) => {
            const beneficialFieldKey: BeneficialOwnerDataKey = `${BENEFICIAL_PREFIX}_${CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY}_${fieldName}`;

            if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                signerDetails[FULL_NAME] = signerDetails[FULL_NAME]
                    ? `${String(signerDetails[FULL_NAME])} ${String(reimbursementAccountDraft?.[beneficialFieldKey])}`
                    : String(reimbursementAccountDraft?.[beneficialFieldKey]);
                directorIDs.forEach((directorID: string) => {
                    const key = `${DIRECTOR_PREFIX}_${directorID}_${DIRECTOR_FULL_NAME}`;

                    if (directorID !== CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY) {
                        return;
                    }

                    if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                        signerDetails[key] = signerDetails[key]
                            ? `${String(signerDetails[key])} ${String(reimbursementAccountDraft?.[beneficialFieldKey])}`
                            : String(reimbursementAccountDraft?.[beneficialFieldKey]);
                    }
                });
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
        const key = `signer_${fieldName}` as keyof SignerInfoStepProps;

        if (!reimbursementAccountDraft?.[key]) {
            return;
        }

        signerFiles[fieldName] = reimbursementAccountDraft?.[key][0];
    });

    return {signerDetails, signerFiles};
}

export default getSignerDetailsAndSignerFilesForSignerInfo;
