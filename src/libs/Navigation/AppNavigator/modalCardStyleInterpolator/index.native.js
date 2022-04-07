import baseModalCardStyleInterpolator from './baseModalCardStyleInterpolator';

const cardStyle = {};

export default (
    isSmallScreenWidth,
    isFullScreenModal,
    {
        current: {progress},
        inverted,
        layouts: {
            screen,
        },
    },
) => baseModalCardStyleInterpolator(
    isSmallScreenWidth,
    isFullScreenModal,
    {
        current: {progress},
        inverted,
        layouts: {
            screen,
        },
    },
    cardStyle,
);
