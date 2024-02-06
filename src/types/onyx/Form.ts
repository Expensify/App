import type {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';
import type PersonalBankAccount from './PersonalBankAccount';

type FormValueType = string | boolean | Date | OnyxCommon.Errors;

type BaseForm = {
    /** Controls the loading state of the form */
    isLoading?: boolean;

    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors | null;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields | null;
};

type Form<TFormValues extends Record<string, FormValueType> = Record<string, FormValueType>> = TFormValues & BaseForm;

type AddDebitCardForm = Form<{
    /** Whether the form has been submitted */
    setupComplete: boolean;
}>;

type DateOfBirthForm = Form<{
    /** Date of birth */
    dob?: string;
}>;

type DisplayNameForm = Form<{
    firstName: string;
    lastName: string;
}>;

type NewRoomForm = Form<{
    roomName?: string;
    reportDescription?: string;
    policyID?: string;
    writeCapability?: string;
    visibility?: string;
}>;

type IKnowATeacherForm = Form<{
    firstName: string;
    lastName: string;
    partnerUserID: string;
}>;

type IntroSchoolPrincipalForm = Form<{
    firstName: string;
    lastName: string;
    partnerUserID: string;
}>;

type PrivateNotesForm = Form<{
    privateNotes: string;
}>;

type PersonalBankAccountForm = Form<PersonalBankAccount>;

type AddressForm = Form<{
    /** Address line 1 for delivery */
    addressLine1: string;

    /** Address line 2 for delivery */
    addressLine2: string;

    /** City for delivery */
    city: string;

    /** Country for delivery */
    country: keyof typeof CONST.COUNTRY_ZIP_REGEX_DATA | '';

    /** First name for delivery */
    legalFirstName: string;

    /** Last name  for delivery */
    legalLastName: string;

    /** Phone number for delivery */
    phoneNumber: string;

    /** State for delivery */
    state: keyof typeof COMMON_CONST.STATES | '';

    /** Zip code  for delivery */
    zipPostCode: string;
}>;

type WorkspaceSettingsForm = Form<{
    name: string;
}>;

type ReportFieldEditForm = Form<Record<string, string>>;

type CloseAccountForm = Form<{
    reasonForLeaving: string;
    phoneOrEmail: string;
}>;

type RoomNameForm = Form<{
    roomName: string;
}>;

export default Form;

export type {
    AddDebitCardForm,
    AddressForm,
    DateOfBirthForm,
    PrivateNotesForm,
    DisplayNameForm,
    FormValueType,
    NewRoomForm,
    BaseForm,
    IKnowATeacherForm,
    IntroSchoolPrincipalForm,
    PersonalBankAccountForm,
    WorkspaceSettingsForm,
    ReportFieldEditForm,
    CloseAccountForm,
    RoomNameForm,
};
