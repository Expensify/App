import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {BeneficialOwnerDataKey, ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type {FileObject} from '@src/types/utils/Attachment';
import SafeString from '@src/utils/SafeString';

const {
    FIRST_NAME,
    LAST_NAME,
    OWNERSHIP_PERCENTAGE,
    DOB,
    SSN_LAST_4,
    STREET,
    CITY,
    COUNTRY,
    STATE,
    ZIP_CODE,
    PROOF_OF_OWNERSHIP,
    COPY_OF_ID,
    ADDRESS_PROOF,
    CODICE_FISCALE,
    RESIDENTIAL_ADDRESS,
    FULL_NAME,
    NATIONALITY,
    PREFIX,
} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

const ownerDetailsFields = [FIRST_NAME, LAST_NAME, OWNERSHIP_PERCENTAGE, DOB, SSN_LAST_4, STREET, CITY, STATE, ZIP_CODE, COUNTRY, NATIONALITY];
const ownerFilesFields = [PROOF_OF_OWNERSHIP, COPY_OF_ID, ADDRESS_PROOF, CODICE_FISCALE];

function getOwnerDetailsAndOwnerFilesForBeneficialOwners(ownerKeys: string[], reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>) {
    const ownerDetails: Record<BeneficialOwnerDataKey, string | FileObject[]> = {};
    const ownerFiles: Record<BeneficialOwnerDataKey, string | FileObject> = {};

    for (const ownerKey of ownerKeys) {
        const ownerDetailsFullNameKey = `${PREFIX}_${ownerKey}_${FULL_NAME}` as const;
        const ownerDetailsResidentialAddressKey = `${PREFIX}_${ownerKey}_${RESIDENTIAL_ADDRESS}` as const;
        const ownerDetailsNationalityKey = `${PREFIX}_${ownerKey}_${NATIONALITY}` as const;

        for (const fieldName of ownerDetailsFields) {
            const ownerDetailsKey = `${PREFIX}_${ownerKey}_${fieldName}` as const;

            if (!reimbursementAccountDraft?.[ownerDetailsKey]) {
                continue;
            }

            if (fieldName === SSN_LAST_4 && SafeString(reimbursementAccountDraft?.[ownerDetailsNationalityKey]) !== CONST.COUNTRY.US) {
                continue;
            }

            if (fieldName === OWNERSHIP_PERCENTAGE) {
                ownerDetails[ownerDetailsKey] = SafeString(reimbursementAccountDraft?.[ownerDetailsKey]);
                continue;
            }

            if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                ownerDetails[ownerDetailsFullNameKey] = ownerDetails[ownerDetailsFullNameKey]
                    ? `${SafeString(ownerDetails[ownerDetailsFullNameKey])} ${SafeString(reimbursementAccountDraft[ownerDetailsKey])}`
                    : reimbursementAccountDraft[ownerDetailsKey];
                continue;
            }

            if (fieldName === STREET || fieldName === CITY || fieldName === STATE || fieldName === ZIP_CODE || fieldName === COUNTRY) {
                ownerDetails[ownerDetailsResidentialAddressKey] = ownerDetails[ownerDetailsResidentialAddressKey]
                    ? `${SafeString(ownerDetails[ownerDetailsResidentialAddressKey])}, ${SafeString(reimbursementAccountDraft[ownerDetailsKey])}`
                    : reimbursementAccountDraft[ownerDetailsKey];
                continue;
            }

            ownerDetails[ownerDetailsKey] = reimbursementAccountDraft?.[ownerDetailsKey];
        }

        for (const fieldName of ownerFilesFields) {
            const ownerFilesKey = `${PREFIX}_${ownerKey}_${fieldName}` as const;

            if (!reimbursementAccountDraft?.[ownerFilesKey]) {
                continue;
            }

            // User can only upload one file per each field
            const [uploadedFile] = reimbursementAccountDraft?.[ownerFilesKey] || [];
            ownerFiles[ownerFilesKey] = uploadedFile;
        }
    }

    return {ownerDetails, ownerFiles};
}

export default getOwnerDetailsAndOwnerFilesForBeneficialOwners;
