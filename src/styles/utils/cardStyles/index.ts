// eslint-disable-next-line no-restricted-imports
import positioning from '@styles/utils/positioning';
import type GetCardStyles from './types';

/**
 * Get card style for cardStyleInterpolator
 */
const getCardStyles: GetCardStyles = (screenWidth) => ({
    ...positioning.pFixed,
    width: screenWidth,
    height: '100%',
});

export default getCardStyles;
