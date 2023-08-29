function format(locale: string, number: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale, options).format(number);
}

function formatToParts(locale: string, number: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
