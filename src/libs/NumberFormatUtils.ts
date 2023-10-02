function format(locale: string, number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(number);
}

function formatToParts(locale: string, number: number, options?: Intl.NumberFormatOptions): Intl.NumberFormatPart[] {
    return new Intl.NumberFormat(locale, options).formatToParts(number);
}

export {format, formatToParts};
