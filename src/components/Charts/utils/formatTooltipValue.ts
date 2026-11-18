/** One value the tooltip writes out, with its share of the total and the other measure of the same expenses */
type TooltipValue = {
    /** The plotted value, like "$420.42" or "22 expenses" */
    value: string;

    /** The value's share of the total, written in parentheses after it */
    percentage?: string;

    /** The other measure of the same expenses, like the spend behind a count */
    secondaryValue?: string;
};

/** Formats a value with its percentage and secondary value on one line, like "22 expenses (34%) · $420.42" */
function formatTooltipValue({value, percentage, secondaryValue}: TooltipValue): string {
    const withPercentage = percentage ? `${value} (${percentage})` : value;
    return secondaryValue ? `${withPercentage} · ${secondaryValue}` : withPercentage;
}

export default formatTooltipValue;
export type {TooltipValue};
