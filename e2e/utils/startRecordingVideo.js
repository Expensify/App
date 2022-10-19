const execAsync = require('./execAsync');
const {OUTPUT_DIR} = require('../config');
const Logger = require('../utils/logger');

module.exports = () => {
    // The emulator on CI launches with no-window option.
    // Taking screenshots results in blank shots.
    // Recording a video however includes the graphic content.
    const cmd = 'adb shell screenrecord /sdcard/video.mp4';
    let recordingFailed = false;
    const recording = execAsync(cmd);
    recording.catch((error) => {
        // Don't abort on errors
        Logger.warn('Error while recording video', error);
        recordingFailed = true;
    });

    return (save = false) => {
        if (recordingFailed) { return; }

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
            }, 1000); // Give the device some time to finish writing the file
        });
    };
};
