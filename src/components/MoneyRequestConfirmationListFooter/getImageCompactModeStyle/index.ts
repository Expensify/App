import type GetImageCompactModeStyle from './types';

const getImageCompactModeStyle: GetImageCompactModeStyle = (maxWidth, availableWidth, aspectRatio) => {
    const cappedRatio = aspectRatio ? Math.min(aspectRatio, 1) : 1;

    return {
        maxWidth,
        minHeight: 180,
        flexShrink: 1,
        alignSelf: 'center',
        width: '100%',
        marginHorizontal: 0,
        height: 'auto',
        aspectRatio: cappedRatio,
    };
};

export default getImageCompactModeStyle;
