export default function () {
    console.log('RORY_DEBUG polyfilling ListFormat?');
    if (Intl && 'ListFormat' in Intl) {
        console.log('RORY_DEBUG not polyfilling ListFormat');
        return;
    }

    console.log('RORY_DEBUG ListFormat polyfill should be running like now-ish');

    require('@formatjs/intl-listformat/polyfill-force');

    // Load en & es Locale data
    require('@formatjs/intl-listformat/locale-data/en');
    require('@formatjs/intl-listformat/locale-data/es');
}
