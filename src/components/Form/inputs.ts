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

// TODO: Move remaining inputs to INPUTS_IDS object
const INPUTS_IDS = {
    [ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM]: {},
    [ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM]: {
        NAME: 'name',
    },
    [ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM]: {},
    [ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM]: {
        REASON_FOR_LEAVING: 'reasonForLeaving',
        PHONE_OR_EMAIL: 'phoneOrEmail',
    },
    [ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM]: {},
    [ONYXKEYS.FORMS.DISPLAY_NAME_FORM]: {},
    [ONYXKEYS.FORMS.ROOM_NAME_FORM]: {},
    [ONYXKEYS.FORMS.WELCOME_MESSAGE_FORM]: {
        WELCOME_MESSAGE: 'welcomeMessage',
    },
    [ONYXKEYS.FORMS.LEGAL_NAME_FORM]: {},
    [ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM]: {},
    [ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM]: {},
    [ONYXKEYS.FORMS.HOME_ADDRESS_FORM]: ADDRESS_INPUTS_IDS,
    [ONYXKEYS.FORMS.NEW_ROOM_FORM]: {},
    [ONYXKEYS.FORMS.ROOM_SETTINGS_FORM]: {},
    [ONYXKEYS.FORMS.NEW_TASK_FORM]: {},
    [ONYXKEYS.FORMS.EDIT_TASK_FORM]: {},
    [ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM]: {},
    [ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM]: {},
    [ONYXKEYS.FORMS.MONEY_REQUEST_AMOUNT_FORM]: {},
    [ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM]: {},
    [ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM]: {},
    [ONYXKEYS.FORMS.WAYPOINT_FORM]: {},
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM]: {},
    [ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM]: {},
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
    [ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM]: ADDRESS_INPUTS_IDS,
    [ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM]: {},
    [ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM]: {},
    [ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT]: {},
} as const;

/** If this type errors, it means that the `INPUTS_IDS` object is missing some keys. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertOnyxKeys = AssertTypesEqual<keyof OnyxFormValuesMapping, keyof typeof INPUTS_IDS>;
/** Type `MissingKeys` represents the keys that are missing from the `OnyxKey` type. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type MissingKeys = Exclude<keyof OnyxFormValuesMapping, keyof typeof INPUTS_IDS>;

export default INPUTS_IDS;
