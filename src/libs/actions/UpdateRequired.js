
exports.__esModule = true;
exports.alertUser = void 0;
const react_native_onyx_1 = require('react-native-onyx');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

function alertUser() {
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].UPDATE_REQUIRED, true);
}
exports.alertUser = alertUser;
