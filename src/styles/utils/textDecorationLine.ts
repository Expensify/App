import type {TextStyle} from 'react-native';

export default {
    lineThrough: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid',
    },
    underlineLineThrough: {
        textDecorationLine: 'underline line-through',
        textDecorationStyle: 'solid',
    },
    underlineLine: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
    },
} satisfies Record<string, TextStyle>;
