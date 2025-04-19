
exports.__esModule = true;
const BaseLocaleListener_1 = require('./BaseLocaleListener');

const localeListenerConnect = BaseLocaleListener_1['default'].connect;
const localizeListener = {
    connect: localeListenerConnect,
};
exports['default'] = localizeListener;
