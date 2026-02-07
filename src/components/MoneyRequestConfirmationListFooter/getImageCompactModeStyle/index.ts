import type GetImageCompactModeStyle from './types';

const getImageCompactModeStyle: GetImageCompactModeStyle = (maxWidth) => {
    return {
        maxWidth,
        minHeight: 180,
        flexShrink: 1,
        alignSelf: 'center',
        width: '100%',
        marginHorizontal: 0,
        height: 'auto',
    };
};

export default getImageCompactModeStyle;
