import type Form from './Form';

const INPUT_IDS = {
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    PARTNER_USER_ID: 'partnerUserID',
} as const;

type IntroSchoolPrincipalForm = Form<{
    [INPUT_IDS.FIRST_NAME]: string;
    [INPUT_IDS.LAST_NAME]: string;
    [INPUT_IDS.PARTNER_USER_ID]: string;
}>;

export type {IntroSchoolPrincipalForm};
export default INPUT_IDS;
