import type {FileObject} from '@src/types/utils/Attachment';

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    proofOfDirectors?: FileObject;
    addressProof?: FileObject;
    copyOfID?: FileObject;
    codiceFiscaleTaxID?: FileObject;
    bankAccountID: number;
};

export default SaveCorpayOnboardingDirectorInformationParams;
