
exports.__esModule = true;
const react_native_1 = require('react-native');
const Log_1 = require('@libs/Log');

const asyncOpenURL = function (promise, url) {
    if (!url) {
        return;
    }
    promise
        .then(function (params) {
            react_native_1.Linking.openURL(typeof url === 'string' ? url : url(params));
        })
        ['catch'](function () {
            Log_1['default'].warn('[asyncOpenURL] error occured while opening URL', {url});
        });
};
exports['default'] = asyncOpenURL;
