/** Formats an amount followed by its percentage in parentheses */
function formatAmountWithPercentage(amount: string, percentage?: string): string {
    return percentage ? `${amount} (${percentage})` : amount;
}

export default formatAmountWithPercentage;
