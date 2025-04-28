import type {FileObject} from '@components/AttachmentModal';

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    proofOfDirectors?: FileObject;
    addressProof?: FileObject;
    copyOfID?: FileObject;
    codiceFiscaleTaxID?: FileObject;
    bankAccountID: number;
};

export default SaveCorpayOnboardingDirectorInformationParams;
