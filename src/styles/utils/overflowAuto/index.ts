import type {ViewStyle} from 'react-native';
import type OverflowAutoStyles from './types';

/**
 * Web-only style.
 */
const overflowAuto: OverflowAutoStyles = {
    // NOTE: asserting "overflow" to a valid type, because it isn't possible to augment "overflow".
    overflow: 'auto' as ViewStyle['overflow'],
};

export default overflowAuto;
