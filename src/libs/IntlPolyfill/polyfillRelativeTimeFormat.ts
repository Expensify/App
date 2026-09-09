export default function () {
    if (Intl && 'RelativeTimeFormat' in Intl) {
        return;
    }

    require('@formatjs/intl-relativetimeformat/polyfill-force');

    // Load en Locale data for safety fallback
    require('@formatjs/intl-relativetimeformat/locale-data/en');
}
