import type {FormValue} from '@components/Form/types';
import type * as OnyxCommon from './OnyxCommon';

type BaseForm = {
    /** Controls the loading state of the form */
    isLoading?: boolean;

    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors | null;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields | null;
};

type FormValues = Record<string, FormValue>;
type Form<TFormValues extends FormValues = FormValues> = TFormValues & BaseForm;

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
    welcomeMessage?: string;
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

type ReportFieldEditForm = Form<Record<string, string>>;

export default Form;

export type {AddDebitCardForm, DateOfBirthForm, PrivateNotesForm, DisplayNameForm, NewRoomForm, BaseForm, IKnowATeacherForm, IntroSchoolPrincipalForm, ReportFieldEditForm};
