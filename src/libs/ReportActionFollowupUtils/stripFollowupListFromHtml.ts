/**
 * Used for generating preview text in LHN and other places where followups should not be displayed.
 * Implemented here instead of ReportActionFollowupUtils due to circular ref
 * @param html message.html from the report COMMENT actions
 * @returns html with the <followup-list> element and its contents stripped out or undefined if html is undefined
 */
function stripFollowupListFromHtml(html?: string): string | undefined {
    if (!html) {
        return;
    }
    // Matches a <followup-list> HTML element and its entire contents. (<followup-list><followup><followup-text>Question?</followup-text></followup></followup-list>)
    const followUpListRegex = /<followup-list(\s[^>]*)?>[\s\S]*?<\/followup-list>/i;
    return html.replace(followUpListRegex, '').trim();
}

export default stripFollowupListFromHtml;
