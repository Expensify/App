const execAsync = require('./execAsync');
const {OUTPUT_DIR} = require('../config');

module.exports = () => {
    // the emulator on CI launches with no-window option.
    // taking screenshots results in blank shots.
    // Recording a video however includes the graphic content.
    const cmd = 'adb shell screenrecord /sdcard/video.mp4';
    const recording = execAsync(cmd);

    return (save = false) => {
        recording.abort();
        return new Promise((resolve) => {
            if (!save) {
                resolve();
                return;
            }
            setTimeout(() => {
                if (save) {
                    const getVideo = () => execAsync('adb pull /sdcard/video.mp4');
                    const moveVideo = () => execAsync(`mv video.mp4 ${OUTPUT_DIR}/video.mp4`);
                    const cleanupVideo = () => execAsync('adb shell rm /sdcard/video.mp4');
                    getVideo().then(moveVideo).then(cleanupVideo).then(resolve);
                } else {
                    resolve();
                }
            }, 5000); // give the device some time to finish writing the file
        });
    };
};
