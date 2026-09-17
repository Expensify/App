/**
 * Upgrades an already chosen camera format to a phase-detection equivalent where the device has one.
 */
import type PreferPhaseDetectionFormat from './types';

// Vision Camera reports every focus-capable Android camera as contrast-detection, so there is never a
// phase-detection format to upgrade to.
const preferPhaseDetectionFormat: PreferPhaseDetectionFormat = ({format}) => format;

export default preferPhaseDetectionFormat;
