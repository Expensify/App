export default function () {
    if (Intl && 'ListFormat' in Intl) {
        return;
    }

    require('@formatjs/intl-listformat/polyfill-force');

    // Load en Locale data for safety fallback
    require('@formatjs/intl-listformat/locale-data/en');
}
