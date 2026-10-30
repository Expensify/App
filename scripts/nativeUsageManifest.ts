/**
 * Validation shared by the pod and Gradle dependency checks.
 *
 * An `exempt` entry is the one route that skips verification entirely, so the
 * only thing standing behind it is the reason a human wrote and the date they
 * wrote it. That makes the date worth validating as a date: `9999-99-99` and
 * `2026-02-30` both pass a `\d{4}-\d{2}-\d{2}` shape test, and a future date is
 * either a typo or a way to park a review forever.
 *
 * Age is reported as a warning rather than a failure on purpose. Failing on it
 * would turn every exemption into a build that breaks on a date nobody chose,
 * with no code change to explain it.
 */

const STALE_AFTER_DAYS = 365;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type ReviewedDateResult = {error?: string; warning?: string};

/**
 * Checks `reviewed` is a real calendar date, is not in the future, and says how
 * old it is.
 */
function validateReviewedDate(reviewed: string | undefined, label: string): ReviewedDateResult {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(reviewed ?? '');
    if (!match) {
        return {error: `${label}: "reviewed" must be a date in the YYYY-MM-DD format.`};
    }

    const [year, month, day] = match.slice(1).map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
        return {error: `${label}: "reviewed" is ${reviewed ?? ''}, which is not a real date.`};
    }

    // The date is compared against UTC midnight while a developer writes their
    // own local date, so a day of slack keeps every timezone from UTC-12 to
    // UTC+14 out of the future.
    const ageInDays = Math.floor((Date.now() - parsed.getTime()) / MILLISECONDS_PER_DAY);
    if (ageInDays < -1) {
        return {error: `${label}: "reviewed" is ${reviewed ?? ''}, which is in the future.`};
    }
    if (ageInDays > STALE_AFTER_DAYS) {
        return {warning: `${label}: last reviewed ${ageInDays} days ago (${reviewed ?? ''}). Confirm the reason still holds and update the date.`};
    }
    return {};
}

/**
 * Rejects the empty strings a hand-edited manifest can pick up. An empty pattern
 * matches at every position, so one empty entry would make a dependency
 * unconditionally reachable.
 */
function findBlankEntry(values: string[], label: string, field: string): string | undefined {
    if (values.some((value) => !value.trim())) {
        return `${label}: "${field}" must not contain an empty string.`;
    }
    return undefined;
}

export type {ReviewedDateResult};
export {STALE_AFTER_DAYS, validateReviewedDate, findBlankEntry};
