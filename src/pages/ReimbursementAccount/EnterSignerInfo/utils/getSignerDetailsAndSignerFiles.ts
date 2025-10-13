import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type {EnterSignerInfoForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';

const signerDetailsFields = [
    INPUT_IDS.SIGNER_FULL_NAME,
    INPUT_IDS.SIGNER_EMAIL,
    INPUT_IDS.SIGNER_JOB_TITLE,
    INPUT_IDS.SIGNER_DATE_OF_BIRTH,
    INPUT_IDS.SIGNER_STREET,
    INPUT_IDS.SIGNER_CITY,
    INPUT_IDS.SIGNER_STATE,
    INPUT_IDS.SIGNER_ZIP_CODE,
    INPUT_IDS.DOWNLOADED_PDS_AND_FSG,
];
const signerFilesFields = [INPUT_IDS.PROOF_OF_DIRECTORS, INPUT_IDS.SIGNER_ADDRESS_PROOF, INPUT_IDS.SIGNER_COPY_OF_ID, INPUT_IDS.SIGNER_CODICE_FISCALE];

function getSignerDetailsAndSignerFilesForSignerInfo(enterSignerInfoFormDraft: OnyxEntry<EnterSignerInfoForm>, signerEmail: string) {
    const signerDetails: Record<string, string | boolean | FileObject[]> = {};
    const signerFiles: Record<string, string | FileObject | boolean> = {};

    signerDetailsFields.forEach((fieldName: keyof EnterSignerInfoForm) => {
        if (fieldName === INPUT_IDS.SIGNER_EMAIL) {
            signerDetails[fieldName] = signerEmail;
            return;
        }

        if (!enterSignerInfoFormDraft?.[fieldName]) {
            return;
        }

        if (fieldName === INPUT_IDS.SIGNER_STREET || fieldName === INPUT_IDS.SIGNER_CITY || fieldName === INPUT_IDS.SIGNER_STATE || fieldName === INPUT_IDS.SIGNER_ZIP_CODE) {
            signerDetails[INPUT_IDS.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS] = signerDetails[INPUT_IDS.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS]
                ? `${String(signerDetails[INPUT_IDS.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS])}, ${String(enterSignerInfoFormDraft?.[fieldName])}`
                : enterSignerInfoFormDraft?.[fieldName];
            return;
        }

        const value = enterSignerInfoFormDraft?.[fieldName];
        if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value)) {
            signerDetails[fieldName] = value;
        }
    });

    signerFilesFields.forEach((fieldName) => {
        if (!enterSignerInfoFormDraft?.[fieldName]) {
            return;
        }

        // eslint-disable-next-line rulesdir/prefer-at
        signerFiles[fieldName] = enterSignerInfoFormDraft?.[fieldName][0];
    });

    return {signerDetails, signerFiles};
}

export default getSignerDetailsAndSignerFilesForSignerInfo;
