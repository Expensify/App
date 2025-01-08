import type {FileObject} from '@components/AttachmentModal';

type SaveCorpayOnboardingCompanyDirector = {
    signerFullName: string;
    signerDateOfBirth: string;
    signerJobTitle: string;
    signerEmail: string;
    signerCompleteResidentialAddress: string;
};

type SaveCorpayOnboardingDirectorInformation = {
    companyDirectors: SaveCorpayOnboardingCompanyDirector[];
    proofOfDirectors?: FileObject[] | string;
    copyOfID?: FileObject[] | string;
    addressProof?: FileObject[] | string;
    codiceProof?: FileObject[] | string;
    pdsAndFSG?: FileObject[] | string;
};

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    bankAccountID: number;
    proofOfDirectors?: FileObject[] | string;
    copyOfID?: FileObject[] | string;
    addressProof?: FileObject[] | string;
    codiceProof?: FileObject[] | string;
    pdsAndFSG?: FileObject[] | string;
};

export type {SaveCorpayOnboardingDirectorInformation, SaveCorpayOnboardingDirectorInformationParams};
