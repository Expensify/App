import type {LocaleContextProps} from '@components/LocaleContextProvider';

/** An average or a change between periods falls between whole expenses, so a count rounds rather than writing out every digit of the division */
const MAX_COUNT_FRACTION_DIGITS = 2;

/**
 * Names a count of expenses in the viewer's locale, e.g. "1,234.5 expenses".
 * The number is formatted here and passed to the translation rather than left to it, because locales whose `one` plural category also covers 0 and fractions
 * would otherwise print a literal "1" for them.
 */
function formatExpenseCount(count: number, translate: LocaleContextProps['translate'], numberFormat: LocaleContextProps['numberFormat']): string {
    const rounded = Number(count.toFixed(MAX_COUNT_FRACTION_DIGITS));
    return translate('iou.expenseCount', {count: rounded, formattedCount: numberFormat(rounded, {maximumFractionDigits: MAX_COUNT_FRACTION_DIGITS})});
}

export default formatExpenseCount;
