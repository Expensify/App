import type {FileObject} from '@pages/media/AttachmentModalScreen/types';

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    proofOfDirectors?: FileObject;
    addressProof?: FileObject;
    copyOfID?: FileObject;
    codiceFiscaleTaxID?: FileObject;
    bankAccountID: number;
};

export default SaveCorpayOnboardingDirectorInformationParams;
