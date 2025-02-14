import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import CONST from '@src/CONST';
import type {FileObject} from '@components/AttachmentModal';

type SignerInfoDirector = {
    fullName: string;
    jobTitle: string;
    occupation: string;
};

type SignerInfoValues = {
    dateOfBirth: string;
    fullName: string;
    jobTitle: string;
    city: string;
    state: string;
    street: string;
    zipCode: string;
    directors: SignerInfoDirector[];
    proofOfDirectors: FileObject[];
    copyOfId: FileObject[];
    addressProof: FileObject[];
    codiceFisclaleTaxID: FileObject[];
    PRDandFSG: FileObject[];
};

function getValuesForSignerInfo(directorIDs: string[], reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>): SignerInfoValues {
    if (!reimbursementAccountDraft) {
        return {
            dateOfBirth: '',
            fullName: '',
            jobTitle: '',
            city: '',
            state: '',
            street: '',
            zipCode: '',
            directors: [],
            proofOfDirectors: [],
            copyOfId: [],
            addressProof: [],
            codiceFisclaleTaxID: [],
            PRDandFSG: [],
        };
    }

    const directorsPrefix = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA.PREFIX;
    const signerPrefix = 'signer';
    const signerInfoKeys = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

    return {
        dateOfBirth: reimbursementAccountDraft[signerInfoKeys.DATE_OF_BIRTH] ?? '',
        fullName: reimbursementAccountDraft[signerInfoKeys.FULL_NAME] ?? '',
        jobTitle: reimbursementAccountDraft[signerInfoKeys.JOB_TITLE] ?? '',
        city: reimbursementAccountDraft[signerInfoKeys.CITY] ?? '',
        state: reimbursementAccountDraft[signerInfoKeys.STATE] ?? '',
        street: reimbursementAccountDraft[signerInfoKeys.STREET] ?? '',
        zipCode: reimbursementAccountDraft[signerInfoKeys.ZIP_CODE] ?? '',
        directors: directorIDs.map((directorID) => {
            const directorKey = `${directorsPrefix}_${directorID}`;

            return {
                fullName: reimbursementAccountDraft[`${directorKey}_${signerInfoKeys.DIRECTOR_FULL_NAME}`] ?? '',
                jobTitle: reimbursementAccountDraft[`${directorKey}_${signerInfoKeys.DIRECTOR_JOB_TITLE}`] ?? '',
                occupation: reimbursementAccountDraft[`${directorKey}_${signerInfoKeys.DIRECTOR_OCCUPATION}`] ?? '',
            } as SignerInfoDirector;
        }),
        proofOfDirectors: reimbursementAccountDraft[`${signerPrefix}_${signerInfoKeys.PROOF_OF_DIRECTORS}`] ?? [],
        copyOfId: reimbursementAccountDraft[`${signerPrefix}_${signerInfoKeys.COPY_OF_ID}`] ?? [],
        addressProof: reimbursementAccountDraft[`${signerPrefix}_${signerInfoKeys.ADDRESS_PROOF}`] ?? [],
        codiceFisclaleTaxID: reimbursementAccountDraft[`${signerPrefix}_${signerInfoKeys.CODICE_FISCALE}`] ?? [],
        PRDandFSG: reimbursementAccountDraft[`${signerPrefix}_${signerInfoKeys.PRD_AND_SFG}`] ?? [],
    } as SignerInfoValues;
}

export default getValuesForSignerInfo;
