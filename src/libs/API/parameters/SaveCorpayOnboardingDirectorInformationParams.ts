import type {FileObject} from '@src/types/utils/Attachment';

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    proofOfDirectors?: FileObject;
    signerAddressProof?: FileObject;
    signerCopyOfID?: FileObject;
    signerCodiceFiscaleTaxID?: FileObject;
    bankAccountID: number;
};

export default SaveCorpayOnboardingDirectorInformationParams;
