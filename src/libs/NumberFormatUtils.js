function format(locale, number, options) {
    return new Intl.NumberFormat(locale, options).format(number);
}

function formatToParts(locale, number, options) {
    return new Intl.NumberFormat(locale, options).formatToParts(number);
}

export {
    format,
    formatToParts,
};
