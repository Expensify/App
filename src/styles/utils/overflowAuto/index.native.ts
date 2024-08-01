import type OverflowAutoStyles from './types';

// Overflow auto doesn't exist in react-native so we'll default to overflow: visible
const overflowAuto: OverflowAutoStyles = {
    overflow: 'visible',
};

export default overflowAuto;
