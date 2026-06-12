import type {ValueOf} from 'type-fest';
import type {FileObject} from '@src/types/utils/Attachment';
import type Form from './Form';

const INPUT_IDS = {
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER: 'businessRegistrationIncorporationNumber',
    BUSINESS_CATEGORY: 'natureOfBusiness',
    APPLICANT_TYPE_ID: 'applicantTypeId',
    TRADE_VOLUME: 'tradeVolume',
    ANNUAL_VOLUME: 'annualVolume',
    PROVIDE_TRUTHFUL_INFORMATION: 'provideTruthfulInformation',
    AGREE_TO_TERMS_AND_CONDITIONS: 'agreeToTermsAndConditions',
    CONSENT_TO_PRIVACY_NOTICE: 'consentToPrivacyNotice',
    AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: 'authorizedToBindClientToAgreement',
    ACH_AUTHORIZATION_FORM: 'achAuthorizationForm',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EnableGlobalReimbursementsForm = Form<
    InputID,
    {
        [INPUT_IDS.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: string;
        [INPUT_IDS.BUSINESS_CATEGORY]: string;
        [INPUT_IDS.APPLICANT_TYPE_ID]: string;
        [INPUT_IDS.TRADE_VOLUME]: string;
        [INPUT_IDS.ANNUAL_VOLUME]: string;
        [INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION]: boolean;
        [INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS]: boolean;
        [INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE]: boolean;
        [INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]: boolean;
        [INPUT_IDS.ACH_AUTHORIZATION_FORM]: FileObject[];
    }
> & {isEnablingGlobalReimbursements?: boolean; isSuccess?: boolean};

export type {EnableGlobalReimbursementsForm};
export default INPUT_IDS;
