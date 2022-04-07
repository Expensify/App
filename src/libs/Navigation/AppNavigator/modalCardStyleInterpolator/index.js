import baseModalCardStyleInterpolator from './baseModalCardStyleInterpolator';
import {getCardStyle} from '../../../../styles/StyleUtils';

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
) => {
    return baseModalCardStyleInterpolator(
        isSmallScreenWidth,
        isFullScreenModal,
        {
            current: {progress},
            inverted,
            layouts: {
                screen,
            },
        },
        getCardStyle(isSmallScreenWidth, screen),
    );
}
