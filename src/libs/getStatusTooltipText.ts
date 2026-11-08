/** Text of the tooltip shown over a user's emoji status: the status text, followed by when it clears if it has an end date. */
function getStatusTooltipText(statusText: string, formattedClearAfterDate: string) {
    if (!formattedClearAfterDate) {
        return statusText;
    }
    return `${statusText ? `${statusText} ` : ''}(${formattedClearAfterDate})`;
}

export default getStatusTooltipText;
