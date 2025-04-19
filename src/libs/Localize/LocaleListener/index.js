'use strict';
exports.__esModule = true;
var BaseLocaleListener_1 = require('./BaseLocaleListener');
var localeListenerConnect = BaseLocaleListener_1['default'].connect;
var localizeListener = {
    connect: localeListenerConnect,
};
exports['default'] = localizeListener;
