import type * as OnyxCommon from './OnyxCommon';

/** Model of action to add a new contact method */
type ContactAction = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** Phone/Email associated with user */
        contactMethod?: string;

        /** Whether the user validation code was sent */
        validateCodeSent?: boolean;

        /** Field-specific server side errors keyed by microtime */
        errorFields?: OnyxCommon.ErrorFields;
    },
    'actionVerified'
>;

/** Record of user login data, indexed by partnerUserID */
type PendingContactAction = ContactAction;

export default ContactAction;
export type {PendingContactAction};
