import type {FileObject} from '@components/AttachmentModal';

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    directorIDs?: string;
    proofOfDirectors?: FileObject;
    addressProof?: FileObject;
    copyOfID?: FileObject;
    codiceFiscaleTaxID?: FileObject;
    PRDandFSG?: FileObject;
    bankAccountID: number;
};

export default SaveCorpayOnboardingDirectorInformationParams;
