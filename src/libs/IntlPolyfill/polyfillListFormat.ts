export default function () {
    if (Intl && 'ListFormat' in Intl) {
        return;
    }

    require('@formatjs/intl-listformat/polyfill-force');

    // Load locale data for all supported locales. pt covers pt-BR; zh covers zh-hans.
    require('@formatjs/intl-listformat/locale-data/en');
    require('@formatjs/intl-listformat/locale-data/es');
    require('@formatjs/intl-listformat/locale-data/de');
    require('@formatjs/intl-listformat/locale-data/fr');
    require('@formatjs/intl-listformat/locale-data/it');
    require('@formatjs/intl-listformat/locale-data/ja');
    require('@formatjs/intl-listformat/locale-data/nl');
    require('@formatjs/intl-listformat/locale-data/pl');
    require('@formatjs/intl-listformat/locale-data/pt');
    require('@formatjs/intl-listformat/locale-data/zh');
}
