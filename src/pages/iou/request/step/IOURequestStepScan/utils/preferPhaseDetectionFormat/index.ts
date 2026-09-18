/**
 * Upgrades an already chosen camera format to a phase-detection equivalent where the device has one.
 */
import type PreferPhaseDetectionFormat from './types';

// Only the native camera picks a format, so there is nothing to upgrade on web.
const preferPhaseDetectionFormat: PreferPhaseDetectionFormat = ({format}) => format;

export default preferPhaseDetectionFormat;
