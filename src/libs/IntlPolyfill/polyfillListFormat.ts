export default function () {
    if (Intl && 'ListFormat' in Intl) {
        return;
    }

    require('@formatjs/intl-listformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-listformat/locale-data/en');
    require('@formatjs/intl-listformat/locale-data/es');
}
