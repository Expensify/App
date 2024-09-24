import type {ViewStyle} from 'react-native';

/**
 * Sizing utility styles with Bootstrap inspired naming.
 *
 * https://getbootstrap.com/docs/5.0/utilities/sizing/
 */
export default {
    h0: {
        height: 0,
    },
    h100: {
        height: '100%',
    },

    h68: {
        height: 272,
    },

    h13: {
        height: 52,
    },

    w15: {
        width: '15%',
    },

    w20: {
        width: '20%',
    },

    w25: {
        width: '25%',
    },

    mh100: {
        maxHeight: '100%',
    },

    mnh100: {
        minHeight: '100%',
    },

    mnh20: {
        minHeight: 80,
    },
    mnh40: {
        minHeight: 40,
    },

    mnh0: {
        minHeight: 0,
    },

    mnw0: {
        minWidth: 0,
    },

    mnw2: {
        minWidth: 8,
    },

    mnw25: {
        minWidth: '25%',
    },

    mnw60: {
        minWidth: '60%',
    },

    mnw100: {
        minWidth: '100%',
    },

    mnw120: {
        minWidth: 120,
    },

    w40: {
        width: '40%',
    },

    w50: {
        width: '50%',
    },

    w70: {
        width: '70%',
    },

    w80: {
        width: '80%',
    },

    w100: {
        width: '100%',
    },

    mwn: {
        maxWidth: 'auto',
    },

    mw50: {
        maxWidth: '50%',
    },

    mw75: {
        maxWidth: '75%',
    },

    mw100: {
        maxWidth: '100%',
    },
    wAuto: {
        width: 'auto',
    },
    wFitContent: {
        width: 'fit-content',
    },
} satisfies Record<string, ViewStyle>;
