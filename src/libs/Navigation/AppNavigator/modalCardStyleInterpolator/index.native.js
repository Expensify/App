import baseModalCardStyleInterpolator from './baseModalCardStyleInterpolator';

const cardStyle = {};

export default () => baseModalCardStyleInterpolator(
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
