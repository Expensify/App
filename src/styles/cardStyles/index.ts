import {ViewStyle} from 'react-native';
import GetCardStyles from './types';

/**
 * Get card style for cardStyleInterpolator
 */
const getCardStyles: GetCardStyles = (screenWidth) => ({
    // NOTE: asserting "position" to a valid type, because isn't possible to augment "position".
    position: 'fixed' as ViewStyle['position'],
    width: screenWidth,
    height: '100%',
});

export default getCardStyles;
