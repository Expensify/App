import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';

const ADDRESS_INPUTS_IDS = {
    ADDRESS_LINE_1: 'addressLine1',
    ADDRESS_LINE_2: 'addressLine2',
    COUNTRY: 'country',
    STATE: 'state',
    CITY: 'city',
    ZIP_POST_CODE: 'zipPostCode',
} as const;

const INPUTS_IDS = {
    [ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM]: {
        NAME_ON_CARD: 'nameOnCard',
        CARD_NUMBER: 'cardNumber',
        EXPIRATION_DATE: 'expirationDate',
        SECURITY_CODE: 'securityCode',
        ADDRESS_STREET: 'addressStreet',
        ADDRESS_ZIP_CODE: 'addressZipCode',
        ADDRESS_STATE: 'addressState',
        ACCEPT_TERMS: 'acceptTerms',
    },
    [ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM]: {
        NAME: 'name',
    },
    [ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM]: {
        RATE: 'rate',
        UNIT: 'unit',
    },
    [ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM]: {
        REASON_FOR_LEAVING: 'reasonForLeaving',
        PHONE_OR_EMAIL: 'phoneOrEmail',
    },
    [ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM]: {},
    [ONYXKEYS.FORMS.DISPLAY_NAME_FORM]: {
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName',
    },
    [ONYXKEYS.FORMS.ROOM_NAME_FORM]: {
        ROOM_NAME: 'roomName',
    },
    [ONYXKEYS.FORMS.REPORT_DESCRIPTION_FORM]: {
        REPORT_DESCRIPTION: 'reportDescription',
    },
    [ONYXKEYS.FORMS.LEGAL_NAME_FORM]: {
        LEGAL_FIRST_NAME: 'legalFirstName',
        LEGAL_LAST_NAME: 'legalLastName',
    },
    [ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM]: {
        WELCOME_MESSAGE: 'welcomeMessage',
    },
    [ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM]: {
        DOB: 'dob',
    },
    [ONYXKEYS.FORMS.HOME_ADDRESS_FORM]: ADDRESS_INPUTS_IDS,
    [ONYXKEYS.FORMS.NEW_ROOM_FORM]: {
        ROOM_NAME: 'roomName',
        REPORT_DESCRIPTION: 'reportDescription',
        POLICY_ID: 'policyID',
        WRITE_CAPABILITY: 'writeCapability',
        VISIBILITY: 'visibility',
    },
    [ONYXKEYS.FORMS.ROOM_SETTINGS_FORM]: {},
    [ONYXKEYS.FORMS.NEW_TASK_FORM]: {
        TASK_TITLE: 'taskTitle',
        TASK_DESCRIPTION: 'taskDescription',
    },
    [ONYXKEYS.FORMS.EDIT_TASK_FORM]: {
        TITLE: 'title',
        DESCRIPTION: 'description',
    },
    [ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM]: {
        COMMENT: 'comment',
        MONEY_REQUEST_COMMENT: 'moneyRequestComment',
    },
    [ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM]: {
        MERCHANT: 'merchant',
        MONEY_REQUEST_MERCHANT: 'moneyRequestMerchant',
    },
    [ONYXKEYS.FORMS.MONEY_REQUEST_AMOUNT_FORM]: {},
    [ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM]: {
        CREATED: 'created',
        MONEY_REQUEST_CREATED: 'moneyRequestCreated',
    },
    [ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM]: {
        PHONE_OR_EMAIL: 'phoneOrEmail',
    },
    [ONYXKEYS.FORMS.WAYPOINT_FORM]: {},
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM]: {},
    [ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM]: {
        DATE_TIME: 'dateTime',
    },
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM]: {},
    [ONYXKEYS.FORMS.PRIVATE_NOTES_FORM]: {
        PRIVATE_NOTES: 'privateNotes',
    },

    [ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM]: {
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName',
        PARTNER_USER_ID: 'partnerUserID',
    },
    [ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM]: {
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName',
        PARTNER_USER_ID: 'partnerUserID',
    },

    [ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD]: {},
    [ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM]: {},
    [ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM]: {
        ...ADDRESS_INPUTS_IDS,
        LEGAL_FIRST_NAME: 'legalFirstName',
        LEGAL_LAST_NAME: 'legalLastName',
        PHONE_NUMBER: 'phoneNumber',
    },
    [ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM]: {},
    [ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM]: {
        OWNS_MORE_THAN_25_PERCENT: 'ownsMoreThan25Percent',
        HAS_OTHER_BENEFICIAL_OWNERS: 'hasOtherBeneficialOwners',
        ACCEPT_TERMS_AND_CONDITIONS: 'acceptTermsAndConditions',
        CERTIFY_TRUE_INFORMATION: 'certifyTrueInformation',
        ROUTING_NUMBER: 'routingNumber',
        ACCOUNT_NUMBER: 'accountNumber',
        ACCEPT_TERMS: 'acceptTerms',
        COMPANY_NAME: 'companyName',
        COMPANY_PHONE: 'companyPhone',
        WEBSITE: 'website',
        COMPANY_TAX_ID: 'companyTaxID',
        INCORPORATION_TYPE: 'incorporationType',
        INCORPORATION_DATE: 'incorporationDate',
        INCORPORATION_STATE: 'incorporationState',
        HAS_NO_CONNECTION_TO_CANNABIS: 'hasNoConnectionToCannabis',
        IS_CONTROLLING_OFFICER: 'isControllingOfficer',
        AMOUNT1: 'amount1',
        AMOUNT2: 'amount2',
        AMOUNT3: 'amount3',
    },
    [ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT]: {},
} as const;

/** If this type errors, it means that the `INPUTS_IDS` object is missing some keys. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertOnyxKeys = AssertTypesEqual<keyof OnyxFormValuesMapping, keyof typeof INPUTS_IDS>;
/** Type `MissingKeys` represents the keys that are missing from the `OnyxKey` type. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type MissingKeys = Exclude<keyof OnyxFormValuesMapping, keyof typeof INPUTS_IDS>;

export default INPUTS_IDS;
