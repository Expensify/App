import GetCardStyles from './types';

/**
 * Get card style for cardStyleInterpolator
 */
const getCardStyles: GetCardStyles = (screenWidth) => ({
    position: 'fixed',
    width: screenWidth,
    height: '100%',
});

export default getCardStyles;
