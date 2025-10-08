import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {FileObject} from '@src/types/utils/Attachment';

type SignerInfoValues = {
    dateOfBirth: string;
    fullName: string;
    jobTitle: string;
    city: string;
    state: string;
    street: string;
    zipCode: string;
    proofOfDirectors: FileObject[];
    copyOfId: FileObject[];
    addressProof: FileObject[];
    codiceFiscale: FileObject[];
    downloadedPdsAndFSG: boolean;
};

function getValuesForSignerInfo(reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>): SignerInfoValues {
    if (!reimbursementAccountDraft) {
        return {
            dateOfBirth: '',
            fullName: '',
            jobTitle: '',
            city: '',
            state: '',
            street: '',
            zipCode: '',
            proofOfDirectors: [],
            copyOfId: [],
            addressProof: [],
            codiceFiscale: [],
            downloadedPdsAndFSG: false,
        };
    }

    const signerInfoKeys = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

    return {
        dateOfBirth: reimbursementAccountDraft[signerInfoKeys.DATE_OF_BIRTH] ?? '',
        fullName: reimbursementAccountDraft[signerInfoKeys.FULL_NAME] ?? '',
        jobTitle: reimbursementAccountDraft[signerInfoKeys.JOB_TITLE] ?? '',
        city: reimbursementAccountDraft[signerInfoKeys.CITY] ?? '',
        state: reimbursementAccountDraft[signerInfoKeys.STATE] ?? '',
        street: reimbursementAccountDraft[signerInfoKeys.STREET] ?? '',
        zipCode: reimbursementAccountDraft[signerInfoKeys.ZIP_CODE] ?? '',
        proofOfDirectors: reimbursementAccountDraft[signerInfoKeys.PROOF_OF_DIRECTORS] ?? [],
        copyOfId: reimbursementAccountDraft[signerInfoKeys.COPY_OF_ID] ?? [],
        addressProof: reimbursementAccountDraft[signerInfoKeys.ADDRESS_PROOF] ?? [],
        codiceFiscale: reimbursementAccountDraft[signerInfoKeys.CODICE_FISCALE] ?? [],
        downloadedPdsAndFSG: reimbursementAccountDraft[signerInfoKeys.DOWNLOADED_PDS_AND_FSG] ?? false,
    } as SignerInfoValues;
}

export default getValuesForSignerInfo;
