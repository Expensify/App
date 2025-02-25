import type {FileObject} from '@components/AttachmentModal';

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    directorIDs?: string;
    proofOfDirectors?: FileObject;
    bankAccountID: number;
};

export default SaveCorpayOnboardingDirectorInformationParams;
