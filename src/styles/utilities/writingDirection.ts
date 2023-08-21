/**
 * Writing direction utility styles.
 * Note: writingDirection isn't supported on Android. Unicode controls are being used for Android
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 */

type Direction = {
    writingDirection: 'rtl' | 'ltr';

};

const writingDirection: Record<'rtl' | 'ltr', Direction> = {
    rtl: {
        writingDirection: 'rtl',
    },
    ltr: {
        writingDirection: 'ltr',
    },
};

export default writingDirection;