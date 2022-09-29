const execAsync = require('./execAsync');
const {OUTPUT_DIR} = require('../config');

// https://stackoverflow.com/a/29701428/3668241
module.exports = () => {
    const cmd = `adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png && adb shell rm /sdcard/screen.png && mv screen.png ${OUTPUT_DIR}/screen.png`;
    return execAsync(cmd);
};
