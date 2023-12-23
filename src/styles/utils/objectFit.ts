import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';

export default {
    oFCover: {
        objectFit: 'cover',
    },
    oFFill: {
        objectFit: 'fill',
    },
    oFContain: {
        objectFit: 'contain',
    },
    oFNone: {
        objectFit: 'none',
    },
} satisfies Record<string, ViewStyle | CSSProperties>;
