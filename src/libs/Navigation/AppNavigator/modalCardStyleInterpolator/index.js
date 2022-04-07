import baseModalCardStyleInterpolator from './baseModalCardStyleInterpolator';
import * as StyleUtils from '../../../../styles/StyleUtils';

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
    StyleUtils.getCardStyle(isSmallScreenWidth, screen),
);
