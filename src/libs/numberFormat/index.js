function numberFormat(locale, number, options) {
    return new Intl.NumberFormat(locale, options).format(number);
}

export default numberFormat;
