type SaveCorpayOnboardingDirectorInformation = {
    signerFullName: string;
    signerDateOfBirth: string;
    signerJobTitle: string;
    signerEmail: string;
    signerCompleteResidentialAddress: string;
    secondSignerFullName?: string;
    secondSignerDateOfBirth?: string;
    secondSignerJobTitle?: string;
    secondSignerEmail?: string;
    secondSignerCompleteResidentialAddress?: string;
};

type SaveCorpayOnboardingDirectorInformationParams = {
    inputs: string;
    bankAccountID: number;
    proofOfDirectors?: File;
    copyOfID?: File;
    addressProof?: File;
    codiceProof?: File;
    pdsAndFSG?: File;
};

export type {SaveCorpayOnboardingDirectorInformation, SaveCorpayOnboardingDirectorInformationParams};
