/**
 * Trims the `mailto:` part from mail link.
 * @param mailLink - the `mailto:` link to be trimmed
 * @returns The email address
 */
export function trimMailTo(mailLink: string) {
    return mailLink.replace('mailto:', '');
}

/**
 * Prepends a zero-width space (U+200B) character before all `.` and `@` characters
 * in the email addres to provide explicit line break opportunities for consistent
 * breaking across platforms.
 * @param email - The email address to be sanitized
 * @returns The email with inserted line break opportunities
 */
export function prefixMailSeparatorsWithBreakOpportunities(email: string) {
    return email.replace(
        /([.@])/g,
        // below: zero-width space (U+200B) character
        '​$1',
    );
}
