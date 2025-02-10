import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {BeneficialOwnerDataKey, ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';

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
    PREFIX,
} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

const ownerDetailsFields = [FIRST_NAME, LAST_NAME, OWNERSHIP_PERCENTAGE, DOB, SSN_LAST_4, STREET, CITY, STATE, ZIP_CODE, COUNTRY];
const ownerFilesFields = [PROOF_OF_OWNERSHIP, COPY_OF_ID, ADDRESS_PROOF, CODICE_FISCALE];

function getOwnerDetailsAndOwnerFilesForBeneficialOwners(ownerKeys: string[], reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>) {
    const ownerDetails: Record<BeneficialOwnerDataKey, string | FileObject[]> = {};
    const ownerFiles: Record<BeneficialOwnerDataKey, string | FileObject> = {};

    ownerKeys.forEach((ownerKey) => {
        const ownerDetailsFullNameKey = `${PREFIX}_${ownerKey}_${FULL_NAME}` as const;
        const ownerDetailsResidentialAddressKey = `${PREFIX}_${ownerKey}_${RESIDENTIAL_ADDRESS}` as const;
        const ownerDetailsNationalityKey = `${PREFIX}_${ownerKey}_${COUNTRY}` as const;

        ownerDetailsFields.forEach((fieldName) => {
            const ownerDetailsKey = `${PREFIX}_${ownerKey}_${fieldName}` as const;

            if (!reimbursementAccountDraft?.[ownerDetailsKey]) {
                return;
            }

            if (fieldName === SSN_LAST_4 && String(reimbursementAccountDraft?.[ownerDetailsNationalityKey]) !== CONST.COUNTRY.US) {
                return;
            }

            if (fieldName === OWNERSHIP_PERCENTAGE) {
                ownerDetails[ownerDetailsKey] = `${String(reimbursementAccountDraft?.[ownerDetailsKey])}%`;
                return;
            }

            if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                ownerDetails[ownerDetailsFullNameKey] = ownerDetails[ownerDetailsFullNameKey]
                    ? `${String(ownerDetails[ownerDetailsFullNameKey])} ${String(reimbursementAccountDraft[ownerDetailsKey])}`
                    : reimbursementAccountDraft[ownerDetailsKey];
                return;
            }

            if (fieldName === STREET || fieldName === CITY || fieldName === STATE || fieldName === ZIP_CODE) {
                ownerDetails[ownerDetailsResidentialAddressKey] = ownerDetails[ownerDetailsResidentialAddressKey]
                    ? `${String(ownerDetails[ownerDetailsResidentialAddressKey])}, ${String(reimbursementAccountDraft[ownerDetailsKey])}`
                    : reimbursementAccountDraft[ownerDetailsKey];
                return;
            }

            ownerDetails[ownerDetailsKey] = reimbursementAccountDraft?.[ownerDetailsKey];
        });

        ownerFilesFields.forEach((fieldName) => {
            const ownerFilesKey = `${PREFIX}_${ownerKey}_${fieldName}` as const;

            if (!reimbursementAccountDraft?.[ownerFilesKey]) {
                return;
            }

            // TODO - We're returning only the first file for now. BE will be adjusted later to handle multiple files. I will update this in - https://github.com/Expensify/App/issues/50911
            ownerFiles[ownerFilesKey] = reimbursementAccountDraft?.[ownerFilesKey][0];
        });
    });

    return {ownerDetails, ownerFiles};
}

export default getOwnerDetailsAndOwnerFilesForBeneficialOwners;
