
exports.__esModule = true;
exports.setCurrentDate = void 0;
const react_native_onyx_1 = require('react-native-onyx');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

function setCurrentDate(currentDate) {
    react_native_onyx_1['default'].set(ONYXKEYS_1['default'].CURRENT_DATE, currentDate);
}
exports.setCurrentDate = setCurrentDate;
