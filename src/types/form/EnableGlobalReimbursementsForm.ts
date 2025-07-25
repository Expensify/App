import type {ValueOf} from 'type-fest';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type Form from './Form';

const INPUT_IDS = {
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
        [INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION]: boolean;
        [INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS]: boolean;
        [INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE]: boolean;
        [INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]: boolean;
        [INPUT_IDS.ACH_AUTHORIZATION_FORM]: FileObject[];

    }
>;

export type {EnableGlobalReimbursementsForm};
export default INPUT_IDS;
