import positioning from '@styles/utilities/positioning';
import GetCardStyles from './types';

/**
 * Get card style for cardStyleInterpolator
 */
const getCardStyles: GetCardStyles = (screenWidth) => ({
    ...positioning.pFixed,
    width: screenWidth,
    height: '100%',
});

export default getCardStyles;
