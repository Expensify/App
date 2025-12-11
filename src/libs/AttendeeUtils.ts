import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

/** Formats the title for requiredFields menu item based on which fields are enabled in the policy category */
function formatRequiredFieldsTitle(translate: LocaleContextProps['translate'], policyCategory: PolicyCategory, isAttendeeTrackingEnabled = false): string {
    const enabledFields: string[] = [];

    // Attendees field should show first when both are selected and attendee tracking is enabled
    if (isAttendeeTrackingEnabled && policyCategory.areAttendeesRequired) {
        enabledFields.push(translate('iou.attendees'));
    }

    if (policyCategory.areCommentsRequired) {
        enabledFields.push(translate('common.description'));
    }

    if (enabledFields.length === 0) {
        return '';
    }

    const [first, ...rest] = enabledFields;
    const capitalizedFirst = first.charAt(0).toUpperCase() + first.slice(1);
    const lowercasedRest = rest.map((field) => field.charAt(0).toLowerCase() + field.slice(1));
    return [capitalizedFirst, ...lowercasedRest].join(', ');
}

/** Returns whether there are missing attendees for the given category */
function getIsMissingAttendeesViolation(
    policyCategories: PolicyCategories | undefined,
    category: string,
    iouAttendees: Attendee[] | string | undefined,
    userPersonalDetails: CurrentUserPersonalDetails,
    isAttendeeTrackingEnabled = false,
) {
    const areAttendeesRequired = !!policyCategories?.[category ?? '']?.areAttendeesRequired;
    // If attendee tracking is disabled at the policy level, don't enforce attendee requirement
    if (!isAttendeeTrackingEnabled || !areAttendeesRequired) {
        return false;
    }

    const creatorLogin = userPersonalDetails.login ?? '';
    const attendees = Array.isArray(iouAttendees) ? iouAttendees : [];
    const attendeesMinusCreatorCount = attendees.filter((a) => a?.login !== creatorLogin).length;

    if (attendees.length === 0 || attendeesMinusCreatorCount === 0) {
        return true;
    }

    return false;
}

export {formatRequiredFieldsTitle, getIsMissingAttendeesViolation};
