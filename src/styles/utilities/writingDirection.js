/**
 * Writing direction utility styles.
 * Note: writingDirection isn't supported on Android. Unicode controls are being used for Android
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 */
export default {
    rtl: {
        writingDirection: 'rtl',
    },
    ltr: {
        writingDirection: 'ltr',
    },
};
