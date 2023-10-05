module.exports = function (ms) {
    // Use adb to kill the app
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
