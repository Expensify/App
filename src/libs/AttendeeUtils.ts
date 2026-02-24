import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
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
    isControlPolicy = false,
) {
    // Only enforce attendee requirement on Control policies
    if (!isControlPolicy) {
        return false;
    }

    const areAttendeesRequired = !!policyCategories?.[category ?? '']?.areAttendeesRequired;
    // If attendee tracking is disabled at the policy level, don't enforce attendee requirement
    if (!isAttendeeTrackingEnabled || !areAttendeesRequired) {
        return false;
    }

    const creatorLogin = userPersonalDetails.login ?? '';
    const creatorEmail = userPersonalDetails.email ?? '';
    const attendees = Array.isArray(iouAttendees) ? iouAttendees : [];
    // Check both login and email since attendee objects may have identifier in either property
    const attendeesMinusCreatorCount = attendees.filter((a) => {
        const attendeeIdentifier = a?.login ?? a?.email;
        return attendeeIdentifier !== creatorLogin && attendeeIdentifier !== creatorEmail;
    }).length;

    if (attendees.length === 0 || attendeesMinusCreatorCount === 0) {
        return true;
    }

    return false;
}

/**
 * Syncs the missingAttendees violation with current policy settings.
 * - Adds the violation when it should show but isn't present from BE
 * - Removes stale BE violation when policy settings changed (e.g., category no longer requires attendees)
 */
function syncMissingAttendeesViolation<T extends {name: string}>(
    violations: T[],
    policyCategories: PolicyCategories | undefined,
    category: string,
    attendees: Attendee[] | undefined,
    userPersonalDetails: CurrentUserPersonalDetails,
    isAttendeeTrackingEnabled: boolean,
    isControlPolicy: boolean,
    isInvoice = false,
): T[] {
    // Don't show missingAttendees violation on invoices
    if (isInvoice) {
        return violations.filter((violation) => violation.name !== CONST.VIOLATIONS.MISSING_ATTENDEES);
    }

    const hasMissingAttendeesViolation = violations.some((v) => v.name === CONST.VIOLATIONS.MISSING_ATTENDEES);
    const shouldShowMissingAttendees =
        isControlPolicy && getIsMissingAttendeesViolation(policyCategories ?? {}, category ?? '', attendees ?? [], userPersonalDetails, isAttendeeTrackingEnabled, isControlPolicy);

    if (!hasMissingAttendeesViolation && shouldShowMissingAttendees) {
        // Add violation when it should show but isn't present from BE
        return [
            ...violations,
            {
                name: CONST.VIOLATIONS.MISSING_ATTENDEES,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
            } as unknown as T,
        ];
    }
    if (hasMissingAttendeesViolation && !shouldShowMissingAttendees) {
        // Remove stale BE violation when policy settings changed
        return violations.filter((v) => v.name !== CONST.VIOLATIONS.MISSING_ATTENDEES);
    }

    return violations;
}

export {formatRequiredFieldsTitle, getIsMissingAttendeesViolation, syncMissingAttendeesViolation};
