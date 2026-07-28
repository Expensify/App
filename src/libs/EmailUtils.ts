/**
 * Trims the `mailto:` part from mail link.
 * @param mailLink - The `mailto:` link to be trimmed
 * @returns The email address
 */
function trimMailTo(mailLink: string) {
    return mailLink.replace('mailto:', '');
}

/**
 * Prepends a zero-width space (U+200B) character before all `.` and `@` characters
 * in the email address to provide explicit line break opportunities for consistent
 * breaking across platforms.
 *
 * Note: as explained [here](https://github.com/Expensify/App/issues/30985#issuecomment-1815379835),
 * this only provides opportunities for line breaking (rather than forcing line breaks) that shall
 * be used by the platform implementation when there are no other customary rules applicable
 * and the text would otherwise overflow.
 * @param email - The email address to be sanitized
 * @returns The email with inserted line break opportunities
 */
function prefixMailSeparatorsWithBreakOpportunities(email: string) {
    return email.replaceAll(
        /([.@])/g,
        // below: zero-width space (U+200B) character
        '​$1',
    );
}

export default {trimMailTo, prefixMailSeparatorsWithBreakOpportunities};
