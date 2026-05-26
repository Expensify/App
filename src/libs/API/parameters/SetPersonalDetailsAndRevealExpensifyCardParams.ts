import type {MarqetaAuthTypeName} from '@libs/MultifactorAuthentication/shared/types';

type SetPersonalDetailsAndRevealExpensifyCardParams = {
    cardID: number | string;
    legalFirstName: string;
    legalLastName: string;
    phoneNumber: string;
    addressCity: string;
    addressStreet: string;
    addressStreet2: string;
    addressZip: string;
    addressCountry: string;
    dob: string;
    addressState: string;
    addressProvince: string;
    // US magic-code flow uses validateCode; UK/EU SCA flow uses signedChallenge + authenticationMethod.
    validateCode?: string;
    signedChallenge?: string;
    authenticationMethod?: MarqetaAuthTypeName;
};

export default SetPersonalDetailsAndRevealExpensifyCardParams;
