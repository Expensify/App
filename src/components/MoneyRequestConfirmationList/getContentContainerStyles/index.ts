import type GetContentContainerStyle from './types';

const getContentContainerStyle: GetContentContainerStyle = (isCompactMode, flex1Style) => ({
    contentContainerStyle: isCompactMode ? [flex1Style] : undefined,
});

export default getContentContainerStyle;
